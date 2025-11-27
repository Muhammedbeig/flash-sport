(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,24876,e=>{"use strict";var t=e.i(43476),s=e.i(47163);function a({className:e,...a}){return(0,t.jsx)("div",{className:(0,s.cn)("animate-pulse rounded-md","bg-skeleton",e),...a})}e.s(["Skeleton",()=>a])},41406,e=>{"use strict";var t=e.i(43476),s=e.i(18566),a=e.i(71645),d=e.i(24876),r=e.i(5622);function i(){let e=(0,s.useSearchParams)(),i=e.get("id"),l=e.get("sport")||"football",{theme:o}=(0,r.useTheme)(),[n,c]=(0,a.useState)(!1);return((0,a.useEffect)(()=>{c(!0);let e="player-widget-script";if(!document.getElementById(e)){let t=document.createElement("script");t.id=e,t.src="https://widgets.api-sports.io/3.1.0/widgets.js",t.type="module",t.async=!0,document.body.appendChild(t)}},[]),i)?(0,t.jsx)("div",{className:"p-4 md:p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500",children:(0,t.jsx)("div",{className:"theme-bg rounded-xl shadow-sm border theme-border overflow-hidden min-h-[600px]",children:n?(0,t.jsx)("div",{dangerouslySetInnerHTML:{__html:`
                <api-sports-widget
                  data-type="player"
                  data-player-id="${i}"
                  data-sport="${l}"
                  data-theme="${"dark"===o?"dark":"white"}"
                  data-show-toolbar="false"
                  data-show-errors="false"
                  data-player-statistics="true"
                  data-player-trophies="true"
                  data-season="2023" 
                ></api-sports-widget>
              `}}):(0,t.jsxs)("div",{className:"p-6 space-y-4",children:[(0,t.jsx)(d.Skeleton,{className:"h-32 w-32 rounded-full"}),(0,t.jsx)(d.Skeleton,{className:"h-8 w-64"}),(0,t.jsx)(d.Skeleton,{className:"h-64 w-full"})]})})}):(0,t.jsx)("div",{className:"p-10 text-center text-secondary",children:"No Player Selected"})}function l(){return(0,t.jsx)(a.Suspense,{fallback:(0,t.jsx)("div",{className:"p-10 text-center",children:"Loading player..."}),children:(0,t.jsx)(i,{})})}e.s(["default",()=>l])}]);