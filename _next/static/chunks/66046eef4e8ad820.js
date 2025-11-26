(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,31713,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(18566);let r=(0,e.i(75254).default)("arrow-left",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);function i({className:e="",...a}){return(0,t.jsx)("div",{className:`animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${e}`,style:{animation:"shimmer 1.5s ease-in-out infinite"},...a})}function l(){return(0,t.jsx)("div",{className:"w-full space-y-6",children:[1,2,3].map(e=>(0,t.jsxs)("div",{className:"bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden",children:[(0,t.jsxs)("div",{className:"flex items-center gap-3 p-3 border-b border-gray-100 bg-gray-50/50",children:[(0,t.jsx)(i,{className:"h-6 w-6 rounded-full"})," ",(0,t.jsxs)("div",{className:"space-y-1",children:[(0,t.jsx)(i,{className:"h-4 w-32"})," ",(0,t.jsx)(i,{className:"h-3 w-16"})," "]})]}),(0,t.jsx)("div",{className:"divide-y divide-gray-100",children:[1,2,3].map(e=>(0,t.jsxs)("div",{className:"p-4 hover:bg-gray-50 transition-colors flex items-center justify-between",children:[(0,t.jsxs)("div",{className:"flex flex-col items-center w-12 gap-1 mr-4 border-r border-gray-100 pr-4",children:[(0,t.jsx)(i,{className:"h-3 w-8"}),(0,t.jsx)(i,{className:"h-3 w-10"})]}),(0,t.jsxs)("div",{className:"flex-1 space-y-3",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between",children:[(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)(i,{className:"h-5 w-5 rounded-full"}),(0,t.jsx)(i,{className:"h-4 w-24"})]}),(0,t.jsx)(i,{className:"h-4 w-4"})," "]}),(0,t.jsxs)("div",{className:"flex items-center justify-between",children:[(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)(i,{className:"h-5 w-5 rounded-full"}),(0,t.jsx)(i,{className:"h-4 w-24"})]}),(0,t.jsx)(i,{className:"h-4 w-4"})," "]})]})]},e))})]},e))})}function d({leagueId:e,sport:s="football"}){let[r,i]=(0,a.useState)(!1);(0,a.useEffect)(()=>{i(!0)},[]);let d="",n=`
    data-target-team="#match-details-container"
    data-target-player="#match-details-container"
    data-target-standings="#match-details-container"
    data-favorite="true"
    data-show-errors="true"
    data-theme="white"
  `;return d="f1"===s?`
      <api-sports-widget 
        data-type="races" 
        data-sport="f1"
        data-target-race="#match-details-container"
        data-target-driver="#match-details-container"
        ${n}
      ></api-sports-widget>
    `:"mma"===s?`
      <api-sports-widget 
        data-type="fights" 
        data-sport="mma"
        data-target-fight="#match-details-container"
        data-target-fighter="#match-details-container"
        ${n}
      ></api-sports-widget>
    `:`
      <api-sports-widget 
        data-type="games" 
        data-sport="${s}"
        ${e?`data-league="${e}"`:""} 
        data-target-game="#match-details-container"
        data-show-toolbar="true"
        ${n}
      ></api-sports-widget>
    `,(0,t.jsxs)("div",{className:"w-full min-h-[500px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative",children:[!r&&(0,t.jsx)("div",{className:"absolute inset-0 z-0",children:(0,t.jsx)(l,{})}),(0,t.jsx)("div",{dangerouslySetInnerHTML:{__html:d}})]})}function n(){let e=(0,s.useSearchParams)(),i=(0,s.useRouter)(),l=(0,s.usePathname)(),n=e.get("sport")||"football",c="match"===e.get("view"),[o,m]=(0,a.useState)(!1),h=(0,a.useRef)(null);(0,a.useEffect)(()=>{c?m(!0):(m(!1),h.current&&(h.current.innerHTML=""))},[c]);let u=()=>{let t=new URLSearchParams(e.toString());"match"!==t.get("view")&&(t.set("view","match"),window.history.pushState(null,"",`?${t.toString()}`),m(!0)),window.scrollTo(0,0)};return(0,a.useEffect)(()=>{let e=new MutationObserver(e=>{for(let t of e)"childList"===t.type&&h.current?.hasChildNodes()&&u()});return h.current&&e.observe(h.current,{childList:!0,subtree:!0}),()=>e.disconnect()},[e]),(0,a.useEffect)(()=>{let e=()=>{!new URLSearchParams(window.location.search).get("view")&&(m(!1),h.current&&(h.current.innerHTML=""))};return window.addEventListener("popstate",e),()=>window.removeEventListener("popstate",e)},[]),(0,t.jsxs)("div",{className:"max-w-5xl mx-auto relative min-h-[80vh]",children:[(0,t.jsxs)("div",{className:o?"hidden":"block",children:[(0,t.jsx)("div",{className:"mb-4 flex items-center justify-between",children:(0,t.jsxs)("h2",{className:"text-xl font-bold text-slate-800 capitalize",children:["All ",n," Matches"]})}),(0,t.jsx)(d,{sport:n,leagueId:void 0},`${n}`)]}),(0,t.jsxs)("div",{className:o?"block animate-in fade-in slide-in-from-right-4 duration-300":"hidden",children:[(0,t.jsx)("div",{className:"mb-4 flex items-center gap-2",children:(0,t.jsxs)("button",{onClick:()=>{let t=new URLSearchParams(e.toString());t.delete("view"),i.push(`${l}?${t.toString()}`)},className:"flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-slate-700 font-medium transition-colors shadow-sm",children:[(0,t.jsx)(r,{size:18}),"Back to Feed"]})}),(0,t.jsx)("div",{id:"match-details-container",ref:h,className:"w-full bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] overflow-hidden"})]})]})}function c(){return(0,t.jsx)(a.Suspense,{fallback:(0,t.jsx)("div",{className:"p-10 text-center text-gray-500",children:"Loading..."}),children:(0,t.jsx)(n,{})})}e.s(["default",()=>c],31713)}]);