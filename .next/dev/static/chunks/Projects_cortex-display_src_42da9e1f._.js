(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Projects/cortex-display/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Projects/cortex-display/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Projects/cortex-display/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://zotzigqwmzgnmmkltltm.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHppZ3F3bXpnbm1ta2x0bHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NTI0MzAsImV4cCI6MjA1MjIyODQzMH0.U96jP2GZD7ZdXrgB_Xmkl6PUqBvfjnE9IMrceh9B_Fo");
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Projects/cortex-display/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CortexDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Projects/cortex-display/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Projects/cortex-display/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Projects/cortex-display/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const TASK_LIMITS = {
    low: 3,
    moderate: 5,
    high: 7,
    rest: 1
};
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
}
function formatCapacity(state) {
    return state.charAt(0).toUpperCase() + state.slice(1);
}
function formatEventTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}
function formatRelativeTime(eventDate, now) {
    const diffMs = eventDate.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `in ${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `in ${hours}h ${mins}m` : `in ${hours}h`;
}
function CortexDisplay() {
    _s();
    const [currentTime, setCurrentTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Date());
    const [capacity, setCapacity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('moderate');
    const [tasks, setTasks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [nextEvent, setNextEvent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [undoTask, setUndoTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [undoTimeout, setUndoTimeout] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [toastExiting, setToastExiting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const longPressTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isLongPress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    async function fetchData() {
        const { data: capacityData } = await __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('Capacity').select('state').eq('id', 1).single();
        if (capacityData) {
            setCapacity(capacityData.state);
        }
        const today = new Date().toLocaleDateString('en-CA', {
            timeZone: 'America/Los_Angeles'
        });
        const { data: tasksData } = await __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('tasks').select('id, title, due_date, is_anchor').eq('completed', false).lte('approved_date', today).order('due_date', {
            ascending: true,
            nullsFirst: false
        });
        if (tasksData) {
            setTasks(tasksData);
        }
        const eventRes = await fetch('/api/calendar/next');
        const eventData = await eventRes.json();
        setNextEvent(eventData.event || null);
        setLoading(false);
    }
    async function completeTask(task) {
        if (isLongPress.current) return;
        setTasks((prev)=>prev.filter((t)=>t.id !== task.id));
        setUndoTask(task);
        setToastExiting(false);
        if (undoTimeout) clearTimeout(undoTimeout);
        const timeout = setTimeout(async ()=>{
            await fetch('/api/tasks', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: task.id
                })
            });
            setToastExiting(true);
            setTimeout(()=>{
                setUndoTask(null);
                setToastExiting(false);
            }, 200);
        }, 5000);
        setUndoTimeout(timeout);
    }
    async function undoComplete() {
        if (!undoTask) return;
        if (undoTimeout) clearTimeout(undoTimeout);
        setTasks((prev)=>[
                ...prev,
                undoTask
            ].sort((a, b)=>{
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            }));
        await fetch('/api/tasks', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: undoTask.id,
                action: 'undo'
            })
        });
        setUndoTask(null);
        setUndoTimeout(null);
    }
    async function toggleAnchor(task) {
        const res = await fetch('/api/tasks', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: task.id,
                action: 'toggle_anchor'
            })
        });
        const data = await res.json();
        setTasks((prev)=>prev.map((t)=>t.id === task.id ? {
                    ...t,
                    is_anchor: data.is_anchor
                } : t));
        setToast(data.is_anchor ? `Pinned: ${task.title}` : `Unpinned: ${task.title}`);
        setTimeout(()=>setToast(null), 2000);
    }
    function handlePressStart(task) {
        isLongPress.current = false;
        longPressTimer.current = setTimeout(()=>{
            isLongPress.current = true;
            toggleAnchor(task);
        }, 500);
    }
    function handlePressEnd() {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CortexDisplay.useEffect": ()=>{
            // Update clock every 30 seconds
            const timeInterval = setInterval({
                "CortexDisplay.useEffect.timeInterval": ()=>{
                    setCurrentTime(new Date());
                }
            }["CortexDisplay.useEffect.timeInterval"], 30000);
            // Fetch data on mount and every 30 seconds
            fetchData();
            const dataInterval = setInterval(fetchData, 30000);
            return ({
                "CortexDisplay.useEffect": ()=>{
                    clearInterval(timeInterval);
                    clearInterval(dataInterval);
                }
            })["CortexDisplay.useEffect"];
        }
    }["CortexDisplay.useEffect"], []);
    const anchors = tasks.filter((t)=>t.is_anchor);
    const regularTasks = tasks.filter((t)=>!t.is_anchor);
    const visibleTasks = regularTasks.slice(0, TASK_LIMITS[capacity]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "min-h-screen flex items-center justify-center bg-black",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-white/40 text-4xl",
                children: "Loading"
            }, void 0, false, {
                fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                lineNumber: 208,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
            lineNumber: 207,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen flex flex-col justify-center px-16 py-20 bg-black",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[12vw] font-extralight tracking-tight text-white leading-none mb-2",
                children: formatTime(currentTime)
            }, void 0, false, {
                fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                lineNumber: 215,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[3vw] text-white/50 mb-12",
                children: formatDate(currentTime)
            }, void 0, false, {
                fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                lineNumber: 218,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[2vw] text-white/30 mb-16",
                children: formatCapacity(capacity)
            }, void 0, false, {
                fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                lineNumber: 221,
                columnNumber: 7
            }, this),
            nextEvent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-16 pl-6 border-l-2 border-sky-500/40",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[2.5vw] text-sky-100/80",
                        children: [
                            formatEventTime(new Date(nextEvent.start_at)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-white/50 mx-3",
                                children: "·"
                            }, void 0, false, {
                                fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                                lineNumber: 228,
                                columnNumber: 13
                            }, this),
                            nextEvent.title
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                        lineNumber: 226,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[1.8vw] text-sky-400/60 mt-2 font-medium",
                        children: formatRelativeTime(new Date(nextEvent.start_at), currentTime)
                    }, void 0, false, {
                        fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                        lineNumber: 231,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                lineNumber: 225,
                columnNumber: 9
            }, this),
            anchors.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "space-y-6 mb-12",
                children: anchors.map((task)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        onClick: ()=>completeTask(task),
                        onMouseDown: ()=>handlePressStart(task),
                        onMouseUp: handlePressEnd,
                        onMouseLeave: handlePressEnd,
                        onTouchStart: ()=>handlePressStart(task),
                        onTouchEnd: handlePressEnd,
                        className: "text-[3vw] text-white cursor-pointer hover:text-white/60 active:text-white/40 transition-opacity select-none",
                        children: [
                            "📌 ",
                            task.title
                        ]
                    }, task.id, true, {
                        fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                        lineNumber: 241,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                lineNumber: 239,
                columnNumber: 9
            }, this),
            visibleTasks.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "space-y-6",
                children: visibleTasks.map((task)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        onClick: ()=>completeTask(task),
                        onMouseDown: ()=>handlePressStart(task),
                        onMouseUp: handlePressEnd,
                        onMouseLeave: handlePressEnd,
                        onTouchStart: ()=>handlePressStart(task),
                        onTouchEnd: handlePressEnd,
                        className: "text-[3vw] text-white/70 cursor-pointer hover:text-white/40 active:text-white/20 transition-opacity select-none",
                        children: task.title
                    }, task.id, false, {
                        fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                        lineNumber: 261,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                lineNumber: 259,
                columnNumber: 9
            }, this),
            undoTask && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `fixed bottom-32 left-1/2 bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden ${toastExiting ? 'toast-exit' : 'toast-enter'}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-16 py-8 flex items-center gap-12",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[4vw] text-white/70",
                                children: undoTask.title
                            }, void 0, false, {
                                fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                                lineNumber: 281,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: undoComplete,
                                className: "text-[4vw] text-white/50 font-medium hover:text-white transition-colors px-8 py-4 -my-4 -mr-8 min-h-[80px] min-w-[120px]",
                                children: "Undo"
                            }, void 0, false, {
                                fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                                lineNumber: 282,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                        lineNumber: 280,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-2 bg-white/20 toast-progress"
                    }, undoTask.id, false, {
                        fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                        lineNumber: 289,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                lineNumber: 279,
                columnNumber: 9
            }, this),
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-12 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur px-8 py-4 rounded-full",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Projects$2f$cortex$2d$display$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-white/70 text-xl",
                    children: toast
                }, void 0, false, {
                    fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                    lineNumber: 296,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
                lineNumber: 295,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Projects/cortex-display/src/app/page.tsx",
        lineNumber: 214,
        columnNumber: 5
    }, this);
}
_s(CortexDisplay, "fO+i3VtGGrJ73BHPXoAIZrquJhU=");
_c = CortexDisplay;
var _c;
__turbopack_context__.k.register(_c, "CortexDisplay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Projects_cortex-display_src_42da9e1f._.js.map