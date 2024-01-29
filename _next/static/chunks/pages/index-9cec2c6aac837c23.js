(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{9162:function(e,n,i){"use strict";i.d(n,{ZP:function(){return b}});var r=i(3366),s=i(7462),a=i(7294),t=i(6010),c=i(9766),o=i(8528);const l=["sx"];function d(e){const{sx:n}=e,i=(0,r.Z)(e,l),{systemProps:a,otherProps:t}=(e=>{const n={systemProps:{},otherProps:{}};return Object.keys(e).forEach((i=>{o.G[i]?n.systemProps[i]=e[i]:n.otherProps[i]=e[i]})),n})(i);let d;return d=Array.isArray(n)?[a,...n]:"function"===typeof n?(...e)=>{const i=n(...e);return(0,c.P)(i)?(0,s.Z)({},a,i):a}:(0,s.Z)({},a,n),(0,s.Z)({},t,{sx:d})}var m=i(5408),u=i(7192),h=i(1509),p=i(8010);var g=a.createContext(),x=i(3620);function _(e){return(0,x.Z)("MuiGrid",e)}const f=["auto",!0,1,2,3,4,5,6,7,8,9,10,11,12];var j=(0,i(6087).Z)("MuiGrid",["root","container","item","zeroMinWidth",...[0,1,2,3,4,5,6,7,8,9,10].map((e=>`spacing-xs-${e}`)),...["column-reverse","column","row-reverse","row"].map((e=>`direction-xs-${e}`)),...["nowrap","wrap-reverse","wrap"].map((e=>`wrap-xs-${e}`)),...f.map((e=>`grid-xs-${e}`)),...f.map((e=>`grid-sm-${e}`)),...f.map((e=>`grid-md-${e}`)),...f.map((e=>`grid-lg-${e}`)),...f.map((e=>`grid-xl-${e}`))]),N=i(5893);const v=["className","columns","columnSpacing","component","container","direction","item","lg","md","rowSpacing","sm","spacing","wrap","xl","xs","zeroMinWidth"];function w(e){const n=parseFloat(e);return`${n}${String(e).replace(String(n),"")||"px"}`}function S(e,n,i={}){if(!n||!e||e<=0)return[];if("string"===typeof e&&!Number.isNaN(Number(e))||"number"===typeof e)return[i[`spacing-xs-${String(e)}`]||`spacing-xs-${String(e)}`];const{xs:r,sm:s,md:a,lg:t,xl:c}=e;return[Number(r)>0&&(i[`spacing-xs-${String(r)}`]||`spacing-xs-${String(r)}`),Number(s)>0&&(i[`spacing-sm-${String(s)}`]||`spacing-sm-${String(s)}`),Number(a)>0&&(i[`spacing-md-${String(a)}`]||`spacing-md-${String(a)}`),Number(t)>0&&(i[`spacing-lg-${String(t)}`]||`spacing-lg-${String(t)}`),Number(c)>0&&(i[`spacing-xl-${String(c)}`]||`spacing-xl-${String(c)}`)]}const k=(0,h.ZP)("div",{name:"MuiGrid",slot:"Root",overridesResolver:(e,n)=>{const{container:i,direction:r,item:s,lg:a,md:t,sm:c,spacing:o,wrap:l,xl:d,xs:m,zeroMinWidth:u}=e.ownerState;return[n.root,i&&n.container,s&&n.item,u&&n.zeroMinWidth,...S(o,i,n),"row"!==r&&n[`direction-xs-${String(r)}`],"wrap"!==l&&n[`wrap-xs-${String(l)}`],!1!==m&&n[`grid-xs-${String(m)}`],!1!==c&&n[`grid-sm-${String(c)}`],!1!==t&&n[`grid-md-${String(t)}`],!1!==a&&n[`grid-lg-${String(a)}`],!1!==d&&n[`grid-xl-${String(d)}`]]}})((({ownerState:e})=>(0,s.Z)({boxSizing:"border-box"},e.container&&{display:"flex",flexWrap:"wrap",width:"100%"},e.item&&{margin:0},e.zeroMinWidth&&{minWidth:0},"wrap"!==e.wrap&&{flexWrap:e.wrap})),(function({theme:e,ownerState:n}){const i=(0,m.P$)({values:n.direction,breakpoints:e.breakpoints.values});return(0,m.k9)({theme:e},i,(e=>{const n={flexDirection:e};return 0===e.indexOf("column")&&(n[`& > .${j.item}`]={maxWidth:"none"}),n}))}),(function({theme:e,ownerState:n}){const{container:i,rowSpacing:r}=n;let s={};if(i&&0!==r){const n=(0,m.P$)({values:r,breakpoints:e.breakpoints.values});s=(0,m.k9)({theme:e},n,(n=>{const i=e.spacing(n);return"0px"!==i?{marginTop:`-${w(i)}`,[`& > .${j.item}`]:{paddingTop:w(i)}}:{}}))}return s}),(function({theme:e,ownerState:n}){const{container:i,columnSpacing:r}=n;let s={};if(i&&0!==r){const n=(0,m.P$)({values:r,breakpoints:e.breakpoints.values});s=(0,m.k9)({theme:e},n,(n=>{const i=e.spacing(n);return"0px"!==i?{width:`calc(100% + ${w(i)})`,marginLeft:`-${w(i)}`,[`& > .${j.item}`]:{paddingLeft:w(i)}}:{}}))}return s}),(function({theme:e,ownerState:n}){let i;return e.breakpoints.keys.reduce(((r,a)=>{let t={};if(n[a]&&(i=n[a]),!i)return r;if(!0===i)t={flexBasis:0,flexGrow:1,maxWidth:"100%"};else if("auto"===i)t={flexBasis:"auto",flexGrow:0,flexShrink:0,maxWidth:"none",width:"auto"};else{const c=(0,m.P$)({values:n.columns,breakpoints:e.breakpoints.values}),o="object"===typeof c?c[a]:c;if(void 0===o||null===o)return r;const l=Math.round(i/o*1e8)/1e6+"%";let d={};if(n.container&&n.item&&0!==n.columnSpacing){const i=e.spacing(n.columnSpacing);if("0px"!==i){const e=`calc(${l} + ${w(i)})`;d={flexBasis:e,maxWidth:e}}}t=(0,s.Z)({flexBasis:l,flexGrow:0,maxWidth:l},d)}return 0===e.breakpoints.values[a]?Object.assign(r,t):r[e.breakpoints.up(a)]=t,r}),{})}));var b=a.forwardRef((function(e,n){const i=d((0,p.Z)({props:e,name:"MuiGrid"})),{className:c,columns:o,columnSpacing:l,component:m="div",container:h=!1,direction:x="row",item:f=!1,lg:j=!1,md:w=!1,rowSpacing:b,sm:y=!1,spacing:$=0,wrap:P="wrap",xl:Z=!1,xs:C=!1,zeroMinWidth:M=!1}=i,I=(0,r.Z)(i,v),H=b||$,W=l||$,T=a.useContext(g),R=o||T||12,z=(0,s.Z)({},i,{columns:R,container:h,direction:x,item:f,lg:j,md:w,sm:y,rowSpacing:H,columnSpacing:W,wrap:P,xl:Z,xs:C,zeroMinWidth:M}),D=(e=>{const{classes:n,container:i,direction:r,item:s,lg:a,md:t,sm:c,spacing:o,wrap:l,xl:d,xs:m,zeroMinWidth:h}=e,p={root:["root",i&&"container",s&&"item",h&&"zeroMinWidth",...S(o,i),"row"!==r&&`direction-xs-${String(r)}`,"wrap"!==l&&`wrap-xs-${String(l)}`,!1!==m&&`grid-xs-${String(m)}`,!1!==c&&`grid-sm-${String(c)}`,!1!==t&&`grid-md-${String(t)}`,!1!==a&&`grid-lg-${String(a)}`,!1!==d&&`grid-xl-${String(d)}`]};return(0,u.Z)(p,_,n)})(z);return G=(0,N.jsx)(k,(0,s.Z)({ownerState:z,className:(0,t.Z)(D.root,c),as:m,ref:n},I)),12!==R?(0,N.jsx)(g.Provider,{value:R,children:G}):G;var G}))},8581:function(e,n,i){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return i(3678)}])},8050:function(e,n,i){"use strict";i.d(n,{Z:function(){return f}});var r=i(5893),s=i(9008),a=i(1389),t=i.n(a),c=i(5794),o=i.n(c),l=i(218),d=i(1078),m=i(682),u=i(1664),h=i(7911),p=i.n(h),g=i(3750);function x(){return(0,r.jsx)(l.Z,{bg:"light",expand:"lg",fixed:"top",children:(0,r.jsxs)(m.Z,{fluid:!0,children:[(0,r.jsx)(l.Z.Brand,{children:(0,r.jsx)(u.default,{href:"/",children:(0,r.jsxs)("a",{className:p().navLink,children:[(0,r.jsx)(g.SX3,{})," Home"]})})}),(0,r.jsx)(l.Z.Toggle,{"aria-controls":"navbarScroll"}),(0,r.jsx)(l.Z.Collapse,{id:"navbarScroll",className:"justify-content-end",children:(0,r.jsxs)(d.Z,{children:[(0,r.jsx)(d.Z.Item,{className:"my-2",children:(0,r.jsx)(u.default,{href:"/publication",children:(0,r.jsxs)("a",{className:p().navLink,children:[(0,r.jsx)(g.VLk,{})," Publication"]})})}),(0,r.jsx)(d.Z.Item,{className:"my-2",children:(0,r.jsx)(u.default,{href:"/education",children:(0,r.jsxs)("a",{className:p().navLink,children:[(0,r.jsx)(g.DC2,{})," Education"]})})}),(0,r.jsx)(d.Z.Item,{className:"my-2",children:(0,r.jsx)(u.default,{href:"/project",children:(0,r.jsxs)("a",{className:p().navLink,children:[(0,r.jsx)(g._S5,{})," Project"]})})})]})})]})})}var _="Chuanyu Pan (\u6f58\u4f20\u5b87)";function f(e){var n=e.children;return(0,r.jsxs)("div",{className:t().background,children:[(0,r.jsxs)(s.default,{children:[(0,r.jsx)("title",{children:"Chuanyu Pan"}),(0,r.jsx)("meta",{name:"keywords",content:"ChuanyuPan, \u6f58\u4f20\u5b87, Chuanyu, Tsinghua, \u6e05\u534e"}),(0,r.jsx)("meta",{name:"description",content:"This page is Chuanyu Pan's home page."}),(0,r.jsx)("meta",{name:"author",content:"Chuanyu Pan \u6f58\u4f20\u5b87"}),(0,r.jsx)("meta",{"http-equiv":"content-Type",content:"text/html; charset=utf-8"}),(0,r.jsx)("meta",{name:"google-site-verification",content:"RisFS-DjchuTNwiHmyLFchX4R3TSW4H2DcU57Zza9d0"})]}),(0,r.jsx)(x,{}),(0,r.jsxs)("div",{className:t().container,children:[(0,r.jsxs)("header",{className:t().header,children:[(0,r.jsx)("img",{src:"/images/profile.jpg",className:"".concat(t().headerHomeImage," ").concat(o().borderCircle),alt:_}),(0,r.jsx)("h1",{className:o().heading2Xl,children:_})]}),(0,r.jsx)("main",{children:n}),(0,r.jsx)("footer",{className:t().footer,children:(0,r.jsx)("p",{children:"\xa9 2023 Chuanyu Pan. All rights reserved."})})]})]})}},3678:function(e,n,i){"use strict";i.r(n),i.d(n,{default:function(){return u}});var r=i(5893),s=i(8050),a=i(214),t=i.n(a),c=i(5794),o=i.n(c),l=i(3750),d=i(1664),m=i(9162);function u(){return(0,r.jsx)("div",{children:(0,r.jsx)(s.Z,{children:(0,r.jsxs)("section",{className:o().headingMd,children:[(0,r.jsxs)("section",{className:t().sectioncard,children:[(0,r.jsx)("h2",{className:t().sectiontitle,children:"About me"}),(0,r.jsx)("p",{className:"".concat(t().intropara," ").concat(t().introtext),children:"Hi, I'm currently a 3D AI research engineer at Meshy, exploring future 3D generative tools. I received a master's degree in EECS at UC Berkeley and a bachelor's degree in CS at Tsinghua University (Beijing, China). My working and research interest lies in Computer Graphics and 3D Vision, aiming to enhance machines' 3D perception and create 3D Mixed Reality."}),(0,r.jsxs)("p",{className:t().intropara,children:[(0,r.jsx)(l.HHm,{}),"\xa0\xa0 3D AI Research Engineer @ ",(0,r.jsx)("a",{href:"https://www.meshy.ai/",target:"_blank",className:t().link,children:"Meshy"})]}),(0,r.jsxs)("p",{className:t().intropara,children:[(0,r.jsx)(l.B06,{}),"\xa0\xa0  San Jose, California, United States"]}),(0,r.jsxs)("p",{className:t().intropara,children:[(0,r.jsx)(l.cIw,{}),"\xa0\xa0  chuanyu_pan@berkeley.edu"]}),(0,r.jsxs)("p",{className:t().intropara,children:[(0,r.jsx)(l.I30,{}),"\xa0\xa0  Research Interest: 3D AI, Computer Graphics, VR/AR/MR"]}),(0,r.jsxs)("ul",{className:t().iconpara,children:[(0,r.jsx)("span",{className:t().iconlink,children:(0,r.jsx)("a",{href:"https://github.com/pptrick",className:t().link,children:(0,r.jsx)(l.rFR,{size:23})})}),(0,r.jsx)("span",{className:t().iconlink,children:(0,r.jsx)("a",{href:"https://scholar.google.com/citations?user=wNKoPGAAAAAJ&hl=en",className:t().link,children:(0,r.jsx)(l.VyK,{size:23})})}),(0,r.jsx)("span",{className:t().iconlink,children:(0,r.jsx)("a",{href:"https://www.linkedin.com/in/chuanyu-pan/",className:t().link,children:(0,r.jsx)(l.NQh,{size:23})})}),(0,r.jsx)("span",{className:t().iconlink,children:(0,r.jsx)("a",{href:"/files/resume.pdf",className:t().link,children:(0,r.jsx)(l.wR7,{size:23})})})]})]}),(0,r.jsx)(d.default,{href:"/publication",children:(0,r.jsxs)("section",{className:t().sectioncard,children:[(0,r.jsx)("h2",{className:t().sectiontitle,children:"Publication"}),(0,r.jsx)("div",{className:t().intropara,children:(0,r.jsxs)(m.ZP,{container:!0,spacing:6,children:[(0,r.jsxs)(m.ZP,{item:!0,xs:12,md:4,children:[" ",(0,r.jsx)("img",{src:"/images/pubimg.png",className:t().image,alt:"pubimg"})]}),(0,r.jsxs)(m.ZP,{item:!0,xs:12,md:8,children:[" ",(0,r.jsx)("p",{className:t().imagetext,children:"My research interests mainly lies in 3D vision and computer graphics, and I have publications on top conferences like CVPR, ICLR, etc. I had experience on 3D reconstruction and perception, and hope to investigate more in these fields."})]})]})})]})}),(0,r.jsx)(d.default,{href:"/education",children:(0,r.jsxs)("section",{className:t().sectioncard,children:[(0,r.jsx)("h2",{className:t().sectiontitle,children:"Education"}),(0,r.jsx)("div",{className:t().intropara,children:(0,r.jsxs)(m.ZP,{container:!0,spacing:6,children:[(0,r.jsxs)(m.ZP,{item:!0,xs:12,md:4,children:[" ",(0,r.jsx)("img",{src:"/images/eduimg.png",className:t().image,alt:"pubimg"})]}),(0,r.jsxs)(m.ZP,{item:!0,xs:12,md:8,children:[" ",(0,r.jsx)("p",{className:t().imagetext,children:"I obtained my master's degree from UC Berkeley, major in computer Science (visual computing and computer graphics). Before joining berkeley, I received my bachelor's degree in Computer Science and Technology at Tsinghua University (Beijing, China)."})]})]})})]})})]})})})}},214:function(e){e.exports={intropara:"Home_intropara__3owtp",introtext:"Home_introtext__Q7UXV",iconpara:"Home_iconpara__CUiqN",iconlink:"Home_iconlink__a_sgM",link:"Home_link__mt0ji",sectioncard:"Home_sectioncard__vPYHK",sectiontitle:"Home_sectiontitle__YG2ob",image:"Home_image__yn5pu",imagetext:"Home_imagetext__IfHhr",responsiveFont:"Home_responsiveFont__v7hG_"}},7911:function(e){e.exports={navLink:"Nav_navLink__4uUt6"}},1389:function(e){e.exports={container:"layout_container__5R52X",header:"layout_header__H1FPN",headerImage:"layout_headerImage__m3cc7",headerHomeImage:"layout_headerHomeImage__jaw_C",backToHome:"layout_backToHome__tn1X1",footer:"layout_footer__a_vOy",background:"layout_background__MrGMB"}},5794:function(e){e.exports={heading2Xl:"utils_heading2Xl___9fFP",headingXl:"utils_headingXl__u25Y2",headingLg:"utils_headingLg__5535D",headingMd:"utils_headingMd__gD1Ok",borderCircle:"utils_borderCircle__s2nTm",colorInherit:"utils_colorInherit__mSH_x",padding1px:"utils_padding1px__PWQKR",list:"utils_list__4Mu4l",listItem:"utils_listItem__s2m6i",lightText:"utils_lightText__eUzGY"}}},function(e){e.O(0,[13,84,774,888,179],(function(){return n=8581,e(e.s=n);var n}));var n=e.O();_N_E=n}]);