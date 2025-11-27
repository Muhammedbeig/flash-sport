(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,24876,e=>{"use strict";var t=e.i(43476),a=e.i(47163);function s({className:e,...s}){return(0,t.jsx)("div",{className:(0,a.cn)("animate-pulse rounded-md","bg-skeleton",e),...s})}e.s(["Skeleton",()=>s])},82997,e=>{"use strict";var t=e.i(43476),a=e.i(18566),s=e.i(71645),d=e.i(24876),l=e.i(5622);function i({matchId:e,sport:a="football"}){let[i,r]=(0,s.useState)(!1),{theme:n}=(0,l.useTheme)(),c="dark"===n?"dark":"white";return(0,s.useEffect)(()=>{r(!1);let e=setTimeout(()=>r(!0),800);return()=>clearTimeout(e)},[e,n]),(0,t.jsxs)("div",{className:"w-full theme-bg flex flex-col text-primary",children:[!i&&(0,t.jsxs)("div",{className:"p-4 space-y-4",children:[(0,t.jsx)(d.Skeleton,{className:"h-24 w-full rounded-xl"}),(0,t.jsx)(d.Skeleton,{className:"h-64 w-full rounded-xl"})]}),(0,t.jsx)("div",{className:i?"block animate-in fade-in":"hidden",dangerouslySetInnerHTML:{__html:`
            <api-sports-widget
              data-type="${"f1"===a?"race":"mma"===a?"fight":"game"}"
              ${"f1"===a?`data-race-id="${e}"`:"mma"===a?`data-fight-id="${e}"`:`data-game-id="${e}"`}
              data-sport="${a}"
              data-theme="${c}"
              data-show-toolbar="false"
              data-events="true"
              data-statistics="true"
              data-lineups="true"
            ></api-sports-widget>
          `}})]})}function r(){let e=(0,a.useSearchParams)(),s=e.get("id"),d=e.get("sport")||"football";return s?(0,t.jsx)("div",{className:"p-4 md:p-6 max-w-5xl mx-auto",children:(0,t.jsx)("div",{className:"theme-bg rounded-xl shadow-sm border theme-border overflow-hidden min-h-[600px]",children:(0,t.jsx)(i,{matchId:s,sport:d})})}):(0,t.jsx)("div",{className:"p-8 text-center text-secondary",children:(0,t.jsx)("h2",{className:"text-xl font-bold",children:"No Match Selected"})})}function n(){return(0,t.jsx)(s.Suspense,{fallback:(0,t.jsx)("div",{className:"p-10 text-center",children:"Loading match details..."}),children:(0,t.jsx)(r,{})})}e.s(["default",()=>n],82997)}]);