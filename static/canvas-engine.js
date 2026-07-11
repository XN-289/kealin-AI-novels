/**
 * Kealin Infinite Canvas Engine v5.0
 * 无限画布引擎 — 参考 ReactFlow/VueFlow/LibTV 架构
 * 核心设计：SVG 连线层在 viewport transform 容器内部，使用世界坐标系
 * 连线采用水平贝塞尔曲线，节点拖拽时直接用 world 坐标，无需屏幕↔世界转换
 * 零依赖，纯原生 JavaScript
 */

const CanvasEngine = (() => {
    // ==================== 状态 ====================
    const state = {
        zoom: 1,
        panX: 0,
        panY: 0,
        minZoom: 0.2,
        maxZoom: 3,
        isPanning: false,
        panStartX: 0,
        panStartY: 0,
        panStartPanX: 0,
        panStartPanY: 0,
        dragNode: null,
        dragOffsetX: 0,
        dragOffsetY: 0,
        nodes: new Map(),        // id -> { el, x, y, connections: [{targetId, color}] }
        viewport: null,
        world: null,
        svgLayer: null,
        rafId: null,
        // 连接模式状态
        connecting: false,
        connectFromId: null,
        connectFromHandle: null, // 'output' | 'input'
        connectLineEl: null,
        _onConnect: null,
        // 选区状态
        selectedNodes: new Set(),
        isBoxSelecting: false,
        boxSelectStartScreen: null,
        boxSelectEl: null,
        _onSelectionChange: null,
        _onDeleteSelected: null,
    };

    // ==================== 初始化 ====================
    function init(viewportId, worldId, svgId) {
        state.viewport = document.getElementById(viewportId);
        state.world = document.getElementById(worldId);
        state.svgLayer = document.getElementById(svgId);

        if (!state.viewport || !state.world) {
            console.warn('[CanvasEngine] viewport or world not found');
            return;
        }

        // 设置 transform origin
        state.world.style.transformOrigin = '0 0';

        // 确保 SVG 层正确定位和渲染
        if (state.svgLayer) {
            state.svgLayer.style.position = 'absolute';
            state.svgLayer.style.top = '0';
            state.svgLayer.style.left = '0';
            state.svgLayer.style.width = '10000px';
            state.svgLayer.style.height = '10000px';
            state.svgLayer.style.overflow = 'visible';
            state.svgLayer.style.pointerEvents = 'none';
            state.svgLayer.style.zIndex = '0';
        }

        bindGlobalEvents();
        bindViewportEvents();
        initMinimap();
        requestRedraw();

        // 从 localStorage 恢复画布状态
        restoreCanvasState();
    }

    // ==================== 坐标转换 ====================
    // 核心：SVG 在 world 容器内部，所有坐标都是世界坐标
    // 屏幕坐标 → 世界坐标（用于鼠标事件）
    function screenToWorld(clientX, clientY) {
        const rect = state.viewport.getBoundingClientRect();
        const localX = clientX - rect.left;
        const localY = clientY - rect.top;
        return {
            x: (localX - state.panX) / state.zoom,
            y: (localY - state.panY) / state.zoom,
        };
    }

    // ==================== 事件绑定 ====================
    function bindViewportEvents() {
        // 滚轮缩放（以鼠标为中心）
        state.viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = state.viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const delta = e.deltaY > 0 ? 0.92 : 1.08;
            const newZoom = Math.max(state.minZoom, Math.min(state.maxZoom, state.zoom * delta));

            // 以鼠标位置为中心缩放
            const ratio = newZoom / state.zoom;
            state.panX = mouseX - (mouseX - state.panX) * ratio;
            state.panY = mouseY - (mouseY - state.panY) * ratio;
            state.zoom = newZoom;

            applyTransform();
            updateZoomDisplay();
            saveCanvasState();
        }, { passive: false });

        // 鼠标按下 — 开始平移、拖拽或框选
        state.viewport.addEventListener('mousedown', (e) => {
            // 连接模式下，处理连接目标
            if (state.connecting) {
                const targetNode = e.target.closest('.pyramid-node, .canvas-chapter-card, .canvas-elem-card');
                if (targetNode && targetNode.id !== state.connectFromId) {
                    const result = endConnectMode(targetNode.id);
                    if (result.toId && state._onConnect) {
                        state._onConnect(result.fromId, result.toId);
                    }
                } else {
                    cancelConnectMode();
                }
                return;
            }

            // 如果点击的是连接端口，不处理拖拽/平移
            if (e.target.closest('.ch-card-port')) return;

            // 如果点击的是节点或节点内部元素
            const nodeEl = e.target.closest('.pyramid-node, .canvas-chapter-card, .canvas-elem-card');
            if (nodeEl) {
                // Ctrl+点击：切换选中状态
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    toggleNodeSelection(nodeEl.id);
                    return;
                }
                // 普通点击：清除其他选中，选中当前节点
                if (!state.selectedNodes.has(nodeEl.id)) {
                    clearSelection();
                    selectNode(nodeEl.id);
                }
                // 开始拖拽（单节点或多节点）
                const header = e.target.closest('.node-header, .ch-card-header');
                if (header || e.target === nodeEl) {
                    startDragNode(nodeEl, e);
                }
                return;
            }

            // Ctrl+拖拽空白区域：框选
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                startBoxSelect(e);
                return;
            }

            // 否则清除选区并开始平移画布
            clearSelection();
            startPan(e);
        });

        // 触摸支持
        state.viewport.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                if (touch.target.closest('.ch-card-port')) return;
                const nodeEl = touch.target.closest('.pyramid-node, .canvas-chapter-card');
                if (nodeEl) {
                    const header = touch.target.closest('.node-header, .ch-card-header');
                    if (header || touch.target === nodeEl) {
                        startDragNode(nodeEl, { clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
                    }
                    return;
                }
                startPan({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
            }
        }, { passive: false });

        state.viewport.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                if (state.isPanning) {
                    doPan({ clientX: touch.clientX, clientY: touch.clientY });
                    e.preventDefault();
                } else if (state.dragNode) {
                    doDragNode({ clientX: touch.clientX, clientY: touch.clientY });
                    e.preventDefault();
                }
            }
        }, { passive: false });

        state.viewport.addEventListener('touchend', () => {
            endPan();
            endDragNode();
        });

        // 双击重置视图
        state.viewport.addEventListener('dblclick', (e) => {
            if (e.target.closest('.pyramid-node, .canvas-chapter-card, .canvas-elem-card')) return;
            animateTo(0, 0, 1);
        });
    }

    function bindGlobalEvents() {
        // 节流的 mousemove（16ms = 60fps）
        let moveThrottle = null;
        document.addEventListener('mousemove', (e) => {
            if (moveThrottle) return;
            moveThrottle = requestAnimationFrame(() => {
                moveThrottle = null;
                if (state.connecting) {
                    updateConnectLine(e.clientX, e.clientY);
                } else if (state.isBoxSelecting) {
                    updateBoxSelect(e);
                } else if (state.isPanning) {
                    doPan(e);
                } else if (state.dragNode) {
                    doDragNode(e);
                }
            });
        });

        document.addEventListener('mouseup', (e) => {
            if (state.isBoxSelecting) {
                endBoxSelect(e);
            }
            endPan();
            endDragNode();
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            // ESC 取消连接模式
            if (e.key === 'Escape' && state.connecting) {
                cancelConnectMode();
                return;
            }
            // ESC 清除选区
            if (e.key === 'Escape' && state.selectedNodes.size > 0) {
                clearSelection();
                return;
            }
            // Delete/Backspace 删除选中节点
            if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedNodes.size > 0) {
                // 不在输入框中才触发
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
                e.preventDefault();
                if (state._onDeleteSelected) {
                    state._onDeleteSelected(Array.from(state.selectedNodes));
                }
            }
        });

        // 窗口失焦时清理拖拽状态
        window.addEventListener('blur', () => {
            endPan();
            endDragNode();
            if (state.connecting) cancelConnectMode();
        });
    }

    // ==================== 平移 ====================
    function startPan(e) {
        state.isPanning = true;
        state.panStartX = e.clientX;
        state.panStartY = e.clientY;
        state.panStartPanX = state.panX;
        state.panStartPanY = state.panY;
        state.viewport.style.cursor = 'grabbing';
    }

    function doPan(e) {
        state.panX = state.panStartPanX + (e.clientX - state.panStartX);
        state.panY = state.panStartPanY + (e.clientY - state.panStartY);
        applyTransform();
    }

    function endPan() {
        if (state.isPanning) {
            state.isPanning = false;
            state.viewport.style.cursor = '';
            saveCanvasState();
        }
    }

    // ==================== 节点拖拽（支持多选） ====================
    function startDragNode(nodeEl, e) {
        e.preventDefault();
        state.dragNode = nodeEl;
        const nodeData = state.nodes.get(nodeEl.id);
        if (!nodeData) return;

        // 计算鼠标在节点内的偏移（世界坐标）
        const world = screenToWorld(e.clientX, e.clientY);
        state.dragOffsetX = world.x - nodeData.x;
        state.dragOffsetY = world.y - nodeData.y;

        nodeEl.style.zIndex = '100';
        nodeEl.classList.add('is-dragging');

        // 如果拖拽的节点在选区内，标记所有选中节点的起始偏移
        if (state.selectedNodes.has(nodeEl.id) && state.selectedNodes.size > 1) {
            state._dragGroupOffsets = {};
            state.selectedNodes.forEach(id => {
                const nd = state.nodes.get(id);
                if (nd) {
                    state._dragGroupOffsets[id] = { dx: nd.x - nodeData.x, dy: nd.y - nodeData.y };
                    if (id !== nodeEl.id) {
                        nd.el.style.zIndex = '99';
                        nd.el.classList.add('is-dragging');
                    }
                }
            });
        }
    }

    function doDragNode(e) {
        if (!state.dragNode) return;
        const nodeData = state.nodes.get(state.dragNode.id);
        if (!nodeData) return;

        // 直接用世界坐标计算新位置
        const world = screenToWorld(e.clientX, e.clientY);
        let newX = world.x - state.dragOffsetX;
        let newY = world.y - state.dragOffsetY;

        // 应用网格吸附（20px 网格）
        newX = Math.round(newX / 20) * 20;
        newY = Math.round(newY / 20) * 20;

        nodeData.x = newX;
        nodeData.y = newY;
        state.dragNode.style.left = newX + 'px';
        state.dragNode.style.top = newY + 'px';

        // 移动组内其他选中节点
        if (state._dragGroupOffsets) {
            for (const [id, off] of Object.entries(state._dragGroupOffsets)) {
                if (id === state.dragNode.id) continue;
                const nd = state.nodes.get(id);
                if (nd) {
                    nd.x = newX + off.dx;
                    nd.y = newY + off.dy;
                    nd.el.style.left = nd.x + 'px';
                    nd.el.style.top = nd.y + 'px';
                }
            }
        }

        // 用 raf 节流重绘连线
        requestRedraw();
    }

    function endDragNode() {
        if (state.dragNode) {
            state.dragNode.style.zIndex = '';
            state.dragNode.classList.remove('is-dragging');

            // 清理组内其他节点样式
            if (state._dragGroupOffsets) {
                for (const id of Object.keys(state._dragGroupOffsets)) {
                    if (id === state.dragNode.id) continue;
                    const nd = state.nodes.get(id);
                    if (nd) {
                        nd.el.style.zIndex = '';
                        nd.el.classList.remove('is-dragging');
                    }
                }
                state._dragGroupOffsets = null;
            }

            state.dragNode = null;
            saveCanvasState();
        }
    }

    // ==================== 选区管理 ====================
    function selectNode(id) {
        state.selectedNodes.add(id);
        const nd = state.nodes.get(id);
        if (nd) nd.el.classList.add('is-selected');
        emitSelectionChange();
    }

    function deselectNode(id) {
        state.selectedNodes.delete(id);
        const nd = state.nodes.get(id);
        if (nd) nd.el.classList.remove('is-selected');
        emitSelectionChange();
    }

    function toggleNodeSelection(id) {
        if (state.selectedNodes.has(id)) {
            deselectNode(id);
        } else {
            selectNode(id);
        }
    }

    function clearSelection() {
        state.selectedNodes.forEach(id => {
            const nd = state.nodes.get(id);
            if (nd) nd.el.classList.remove('is-selected');
        });
        state.selectedNodes.clear();
        emitSelectionChange();
    }

    function emitSelectionChange() {
        if (state._onSelectionChange) {
            state._onSelectionChange(Array.from(state.selectedNodes));
        }
    }

    // ==================== 框选 ====================
    function startBoxSelect(e) {
        state.isBoxSelecting = true;
        state.boxSelectStartScreen = { x: e.clientX, y: e.clientY };

        // 创建选框元素
        const box = document.createElement('div');
        box.className = 'canvas-box-select';
        document.body.appendChild(box);
        state.boxSelectEl = box;
        updateBoxSelectRect(e.clientX, e.clientY);
    }

    function updateBoxSelect(e) {
        updateBoxSelectRect(e.clientX, e.clientY);
    }

    function updateBoxSelectRect(currentX, currentY) {
        const box = state.boxSelectEl;
        if (!box) return;
        const sx = state.boxSelectStartScreen.x;
        const sy = state.boxSelectStartScreen.y;
        const left = Math.min(sx, currentX);
        const top = Math.min(sy, currentY);
        const width = Math.abs(currentX - sx);
        const height = Math.abs(currentY - sy);
        box.style.left = left + 'px';
        box.style.top = top + 'px';
        box.style.width = width + 'px';
        box.style.height = height + 'px';
    }

    function endBoxSelect(e) {
        state.isBoxSelecting = false;
        const box = state.boxSelectEl;
        if (!box) return;

        // 计算选框在屏幕上的范围
        const sx = state.boxSelectStartScreen.x;
        const sy = state.boxSelectStartScreen.y;
        const left = Math.min(sx, e.clientX);
        const top = Math.min(sy, e.clientY);
        const right = Math.max(sx, e.clientX);
        const bottom = Math.max(sy, e.clientY);

        // 如果框选区域太小，视为点击而非框选
        if (right - left < 5 && bottom - top < 5) {
            box.remove();
            state.boxSelectEl = null;
            state.boxSelectStartScreen = null;
            clearSelection();
            return;
        }

        // 将屏幕范围转为世界坐标
        const worldTL = screenToWorld(left, top);
        const worldBR = screenToWorld(right, bottom);
        const wLeft = worldTL.x;
        const wTop = worldTL.y;
        const wRight = worldBR.x;
        const wBottom = worldBR.y;

        // 检查每个节点是否在选框内
        state.nodes.forEach((nd, id) => {
            const nw = nd.el.offsetWidth || 220;
            const nh = nd.el.offsetHeight || 120;
            const cx = nd.x + nw / 2;
            const cy = nd.y + nh / 2;
            if (cx >= wLeft && cx <= wRight && cy >= wTop && cy <= wBottom) {
                selectNode(id);
            }
        });

        box.remove();
        state.boxSelectEl = null;
        state.boxSelectStartScreen = null;
    }

    // ==================== 缩放控制 ====================
    function zoomIn() {
        animateTo(state.panX, state.panY, Math.min(state.maxZoom, state.zoom * 1.2));
    }

    function zoomOut() {
        animateTo(state.panX, state.panY, Math.max(state.minZoom, state.zoom / 1.2));
    }

    function zoomFit() {
        if (state.nodes.size === 0) {
            animateTo(0, 0, 1);
            return;
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        state.nodes.forEach(n => {
            minX = Math.min(minX, n.x);
            minY = Math.min(minY, n.y);
            maxX = Math.max(maxX, n.x + (n.el.offsetWidth || 400));
            maxY = Math.max(maxY, n.y + (n.el.offsetHeight || 200));
        });

        const vpW = state.viewport.clientWidth;
        const vpH = state.viewport.clientHeight;
        const contentW = maxX - minX + 80;
        const contentH = maxY - minY + 80;

        const zoom = Math.min(vpW / contentW, vpH / contentH, 1.5);
        const panX = (vpW - contentW * zoom) / 2 - minX * zoom + 40;
        const panY = (vpH - contentH * zoom) / 2 - minY * zoom + 40;

        animateTo(panX, panY, zoom);
    }

    function setZoom(level) {
        state.zoom = Math.max(state.minZoom, Math.min(state.maxZoom, level));
        applyTransform();
        updateZoomDisplay();
    }

    function animateTo(targetPanX, targetPanY, targetZoom, duration = 400) {
        const startPanX = state.panX, startPanY = state.panY, startZoom = state.zoom;
        const startTime = performance.now();

        function step(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic

            state.panX = startPanX + (targetPanX - startPanX) * ease;
            state.panY = startPanY + (targetPanY - startPanY) * ease;
            state.zoom = startZoom + (targetZoom - startZoom) * ease;

            applyTransform();
            updateZoomDisplay();

            if (t < 1) requestAnimationFrame(step);
            else saveCanvasState();
        }
        requestAnimationFrame(step);
    }

    // ==================== 变换应用 ====================
    function applyTransform() {
        if (state.world) {
            state.world.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
        }
        // 更新小地图（节流）
        clearTimeout(state._minimapTimer);
        state._minimapTimer = setTimeout(renderMinimap, 50);
    }

    function requestRedraw() {
        if (!state.rafId) {
            state.rafId = requestAnimationFrame(() => {
                drawConnections();
                renderMinimap();
                state.rafId = null;
            });
        }
    }

    // ==================== 连线绘制（水平贝塞尔曲线）====================
    // 参考 ReactFlow/LibTV 架构：SVG 在 world 容器内部，直接使用世界坐标
    // 节点位置 (x, y) 已经是世界坐标，无需 getBoundingClientRect 转换

    function drawConnections() {
        if (!state.svgLayer) return;

        // 清空现有连线（保留 defs 和临时连接线）
        clearSvgConnections();

        // 绘制每条连线
        state.nodes.forEach((nodeData, nodeId) => {
            if (!nodeData.connections || nodeData.connections.length === 0) return;

            nodeData.connections.forEach(conn => {
                const targetData = state.nodes.get(conn.targetId);
                if (!targetData) return;

                drawBezierConnection(nodeData, targetData, conn.color || '#007AFF');
            });
        });
    }

    function clearSvgConnections() {
        // 高效清空：保留 defs 和 connect-temp-line
        const children = Array.from(state.svgLayer.children);
        for (let i = children.length - 1; i >= 0; i--) {
            const el = children[i];
            if (el.tagName === 'defs' || el.classList.contains('connect-temp-line')) continue;
            el.remove();
        }
    }

    function ensureDefs() {
        // defs 已在 HTML 中预置，无需动态创建
    }

    /**
     * 绘制一条水平贝塞尔曲线连接
     * 参考 ReactFlow: 控制点水平偏移，曲线从右端口到左端口
     * 源节点右边缘中心 → 目标节点左边缘中心
     */
    function drawBezierConnection(fromNode, toNode, color) {
        const fromW = fromNode.el.offsetWidth || 220;
        const fromH = fromNode.el.offsetHeight || 120;
        const toW = toNode.el.offsetWidth || 220;
        const toH = toNode.el.offsetHeight || 120;

        // 源：右边缘中心
        const x1 = fromNode.x + fromW;
        const y1 = fromNode.y + fromH / 2;
        // 目标：左边缘中心
        const x2 = toNode.x;
        const y2 = toNode.y + toH / 2;

        // 水平贝塞尔曲线（ReactFlow/LibTV 同款公式）
        const dx = Math.abs(x2 - x1);
        const curvature = Math.max(dx * 0.4, 60);

        const d = `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;

        // 柔和发光底层
        const glow = createSVGElement('path');
        glow.setAttribute('d', d);
        glow.setAttribute('stroke', color);
        glow.setAttribute('stroke-opacity', '0.1');
        glow.setAttribute('stroke-width', '10');
        glow.setAttribute('fill', 'none');
        glow.setAttribute('stroke-linecap', 'round');
        state.svgLayer.appendChild(glow);

        // 主线 — 半透明虚线，Apple 风格
        const path = createSVGElement('path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-opacity', '0.5');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-dasharray', '8 5');
        state.svgLayer.appendChild(path);

        // 流动圆点动画
        const dotId = 'cdot-' + Math.random().toString(36).substr(2, 8);
        path.setAttribute('id', dotId);

        const circle = createSVGElement('circle');
        circle.setAttribute('r', '3');
        circle.setAttribute('fill', color);
        circle.setAttribute('opacity', '0.6');

        const animateMotion = createSVGElement('animateMotion');
        animateMotion.setAttribute('dur', '3s');
        animateMotion.setAttribute('repeatCount', 'indefinite');
        const mpath = createSVGElement('mpath');
        mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + dotId);
        animateMotion.appendChild(mpath);
        circle.appendChild(animateMotion);
        state.svgLayer.appendChild(circle);

        // 可点击的透明宽区域（hit area），方便点击删除
        const hitArea = createSVGElement('path');
        hitArea.setAttribute('d', d);
        hitArea.setAttribute('stroke', 'transparent');
        hitArea.setAttribute('stroke-width', '16');
        hitArea.setAttribute('fill', 'none');
        hitArea.setAttribute('stroke-linecap', 'round');
        hitArea.style.pointerEvents = 'stroke';
        hitArea.style.cursor = 'pointer';
        hitArea.dataset.fromId = fromNode.el.id;
        hitArea.dataset.toId = toNode.el.id;
        hitArea.classList.add('connection-hit-area');
        state.svgLayer.appendChild(hitArea);

        // hover 高亮效果
        hitArea.addEventListener('mouseenter', () => {
            path.setAttribute('stroke-opacity', '0.9');
            path.setAttribute('stroke-width', '3');
            glow.setAttribute('stroke-opacity', '0.25');
        });
        hitArea.addEventListener('mouseleave', () => {
            path.setAttribute('stroke-opacity', '0.5');
            path.setAttribute('stroke-width', '2');
            glow.setAttribute('stroke-opacity', '0.1');
        });

        // 点击删除连接
        hitArea.addEventListener('click', (e) => {
            e.stopPropagation();
            const fromId = hitArea.dataset.fromId;
            const toId = hitArea.dataset.toId;
            if (state._onConnectionClick) {
                state._onConnectionClick(fromId, toId);
            }
        });
    }

    // ==================== 节点注册 ====================
    function registerNode(el, x, y, connections) {
        if (!el) return;
        const id = el.id || ('node-' + Math.random().toString(36).substr(2, 8));
        if (!el.id) el.id = id;

        state.nodes.set(id, {
            el,
            x: x || 0,
            y: y || 0,
            connections: connections || []
        });

        // 设置绝对定位
        el.style.position = 'absolute';
        el.style.left = (x || 0) + 'px';
        el.style.top = (y || 0) + 'px';
    }

    function updateNodePosition(id, x, y) {
        const node = state.nodes.get(id);
        if (!node) return;
        node.x = x;
        node.y = y;
        node.el.style.left = x + 'px';
        node.el.style.top = y + 'px';
        requestRedraw();
    }

    function setNodeConnections(id, connections) {
        const node = state.nodes.get(id);
        if (!node) return;
        node.connections = connections || [];
        requestRedraw();
    }

    // ==================== 视口状态持久化 ====================
    function saveCanvasState() {
        try {
            localStorage.setItem('canvas-state', JSON.stringify({
                zoom: state.zoom,
                panX: state.panX,
                panY: state.panY
            }));
        } catch (e) { /* ignore */ }
    }

    function restoreCanvasState() {
        try {
            const saved = JSON.parse(localStorage.getItem('canvas-state') || '{}');
            if (saved.zoom) {
                state.zoom = saved.zoom;
                state.panX = saved.panX || 0;
                state.panY = saved.panY || 0;
                applyTransform();
                updateZoomDisplay();
            }
        } catch (e) { /* ignore */ }
    }

    function saveNodePositions() {
        const positions = {};
        state.nodes.forEach((data, id) => {
            positions[id] = { x: data.x, y: data.y };
        });
        try {
            localStorage.setItem('canvas-node-positions', JSON.stringify(positions));
        } catch (e) { /* ignore */ }
    }

    function restoreNodePositions() {
        try {
            const positions = JSON.parse(localStorage.getItem('canvas-node-positions') || '{}');
            Object.entries(positions).forEach(([id, pos]) => {
                const node = state.nodes.get(id);
                if (node) {
                    node.x = pos.x;
                    node.y = pos.y;
                    node.el.style.left = pos.x + 'px';
                    node.el.style.top = pos.y + 'px';
                }
            });
        } catch (e) { /* ignore */ }
    }

    // ==================== 小地图 ====================
    function getWorldBounds(padding = 50) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        state.nodes.forEach(n => {
            minX = Math.min(minX, n.x);
            minY = Math.min(minY, n.y);
            maxX = Math.max(maxX, n.x + (n.el.offsetWidth || 400));
            maxY = Math.max(maxY, n.y + (n.el.offsetHeight || 200));
        });
        if (!isFinite(minX)) return null;
        minX -= padding; minY -= padding;
        maxX += padding; maxY += padding;
        return { minX, minY, maxX, maxY, worldW: maxX - minX, worldH: maxY - minY };
    }

    function renderMinimap() {
        const minimap = document.getElementById('canvas-minimap');
        const minimapVP = document.getElementById('canvas-minimap-vp');
        if (!minimap || !minimapVP || !state.viewport) return;

        const mapW = minimap.offsetWidth || 160;
        const mapH = minimap.offsetHeight || 100;

        const bounds = getWorldBounds();
        if (!bounds) return;
        const { minX, minY, worldW, worldH } = bounds;

        const scaleX = mapW / worldW;
        const scaleY = mapH / worldH;

        // 清除旧的节点点
        minimap.querySelectorAll('.minimap-dot').forEach(d => d.remove());

        // 绘制节点点
        state.nodes.forEach((n, id) => {
            const dot = document.createElement('div');
            dot.className = 'minimap-dot';
            dot.style.cssText = `
                position: absolute;
                width: 4px; height: 4px;
                background: var(--accent);
                border-radius: 1px;
                left: ${(n.x - minX) * scaleX}px;
                top: ${(n.y - minY) * scaleY}px;
            `;
            minimap.appendChild(dot);
        });

        // 更新视口指示器
        const vpLeft = (-state.panX / state.zoom - minX) * scaleX;
        const vpTop = (-state.panY / state.zoom - minY) * scaleY;
        const vpWidth = (state.viewport.clientWidth / state.zoom) * scaleX;
        const vpHeight = (state.viewport.clientHeight / state.zoom) * scaleY;

        minimapVP.style.left = Math.max(0, vpLeft) + 'px';
        minimapVP.style.top = Math.max(0, vpTop) + 'px';
        minimapVP.style.width = Math.min(mapW, vpWidth) + 'px';
        minimapVP.style.height = Math.min(mapH, vpHeight) + 'px';
    }

    // 小地图点击导航
    function initMinimap() {
        const minimap = document.getElementById('canvas-minimap');
        if (!minimap) return;

        minimap.addEventListener('click', (e) => {
            const rect = minimap.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const mapW = rect.width;
            const mapH = rect.height;

            const bounds = getWorldBounds();
            if (!bounds) return;
            const { minX, minY, worldW, worldH } = bounds;

            const targetX = minX + (x / mapW) * worldW;
            const targetY = minY + (y / mapH) * worldH;

            state.panX = -targetX * state.zoom + state.viewport.clientWidth / 2;
            state.panY = -targetY * state.zoom + state.viewport.clientHeight / 2;

            applyTransform();
            saveCanvasState();
            renderMinimap();
        });
    }

    // ==================== 弹窗系统 ====================
    let activePopup = null;

    function showPopup(nodeId, title, content, options = {}) {
        hidePopup();
        const nodeData = state.nodes.get(nodeId);
        if (!nodeData) return;

        const popup = document.createElement('div');
        popup.className = 'canvas-popup';
        popup.innerHTML = `
            <div class="canvas-popup-header">
                <span class="canvas-popup-title">${escapeHtml(title)}</span>
                <button class="canvas-popup-close">&times;</button>
            </div>
            <div class="canvas-popup-body">${content}</div>
        `;

        // 定位到节点旁边（世界坐标）
        const el = nodeData.el;
        popup.style.position = 'absolute';
        popup.style.left = (nodeData.x + (el.offsetWidth || 400) + 16) + 'px';
        popup.style.top = nodeData.y + 'px';
        popup.style.zIndex = '200';

        state.world.appendChild(popup);
        activePopup = popup;

        popup.querySelector('.canvas-popup-close').addEventListener('click', hidePopup);

        setTimeout(() => {
            document.addEventListener('click', handlePopupOutsideClick);
        }, 50);

        if (options.onShow) options.onShow(popup);
    }

    function hidePopup() {
        if (activePopup) {
            activePopup.remove();
            activePopup = null;
            document.removeEventListener('click', handlePopupOutsideClick);
        }
    }

    function handlePopupOutsideClick(e) {
        if (activePopup && !activePopup.contains(e.target) && !e.target.closest('.pyramid-node, .canvas-chapter-card, .canvas-elem-card')) {
            hidePopup();
        }
    }

    // ==================== 连接模式 ====================
    function startConnectMode(fromNodeId, handleType) {
        state.connecting = true;
        state.connectFromId = fromNodeId;
        state.connectFromHandle = handleType || 'output';
        state.viewport.style.cursor = 'crosshair';
        state.viewport.classList.add('connecting-mode');

        // 创建临时贝塞尔连线（替代原来的直线）
        state.connectLineEl = createSVGElement('path');
        state.connectLineEl.setAttribute('stroke', '#007AFF');
        state.connectLineEl.setAttribute('stroke-width', '2.5');
        state.connectLineEl.setAttribute('stroke-dasharray', '8 4');
        state.connectLineEl.setAttribute('stroke-opacity', '0.7');
        state.connectLineEl.setAttribute('fill', 'none');
        state.connectLineEl.setAttribute('stroke-linecap', 'round');
        state.connectLineEl.classList.add('connect-temp-line');
        state.connectLineEl.style.pointerEvents = 'none';
        state.svgLayer.appendChild(state.connectLineEl);
    }

    function updateConnectLine(mouseClientX, mouseClientY) {
        if (!state.connecting || !state.connectLineEl) return;

        const fromData = state.nodes.get(state.connectFromId);
        if (!fromData) return;

        const fromW = fromData.el.offsetWidth || 220;
        const fromH = fromData.el.offsetHeight || 120;

        // 起点：源节点右边缘中心
        const x1 = fromData.x + fromW;
        const y1 = fromData.y + fromH / 2;

        // 终点：鼠标位置转世界坐标
        const world = screenToWorld(mouseClientX, mouseClientY);
        const x2 = world.x;
        const y2 = world.y;

        // 水平贝塞尔
        const dx = Math.abs(x2 - x1);
        const curvature = Math.max(dx * 0.4, 60);
        const d = `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;

        state.connectLineEl.setAttribute('d', d);
    }

    function endConnectMode(targetNodeId) {
        state.connecting = false;
        state.viewport.style.cursor = '';
        state.viewport.classList.remove('connecting-mode');

        if (state.connectLineEl) {
            state.connectLineEl.remove();
            state.connectLineEl = null;
        }

        const result = { fromId: state.connectFromId, toId: targetNodeId };
        state.connectFromId = null;
        state.connectFromHandle = null;
        return result;
    }

    function cancelConnectMode() {
        state.connecting = false;
        state.viewport.style.cursor = '';
        state.viewport.classList.remove('connecting-mode');
        if (state.connectLineEl) {
            state.connectLineEl.remove();
            state.connectLineEl = null;
        }
        state.connectFromId = null;
        state.connectFromHandle = null;
    }

    // ==================== 工具函数 ====================
    function createSVGElement(tag) {
        return document.createElementNS('http://www.w3.org/2000/svg', tag);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function updateZoomDisplay() {
        const el = document.getElementById('zoom-level');
        if (el) el.textContent = Math.round(state.zoom * 100) + '%';
    }

    // ==================== 公共 API ====================
    return {
        init,
        registerNode,
        updateNodePosition,
        setNodeConnections,
        saveNodePositions,
        restoreNodePositions,
        zoomIn,
        zoomOut,
        zoomFit,
        setZoom,
        animateTo,
        showPopup,
        hidePopup,
        drawConnections,
        requestRedraw,
        startConnectMode,
        cancelConnectMode,
        onConnect: (cb) => { state._onConnect = cb; },
        onConnectionClick: (cb) => { state._onConnectionClick = cb; },
        onSelectionChange: (cb) => { state._onSelectionChange = cb; },
        onDeleteSelected: (cb) => { state._onDeleteSelected = cb; },
        selectNode,
        deselectNode,
        clearSelection,
        getSelectedNodes: () => Array.from(state.selectedNodes),
        getState: () => state,
        // 新增：坐标转换 API（供外部使用）
        screenToWorld,
    };
})();
