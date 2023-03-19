(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{9162:function(e,n,i){"use strict";i.d(n,{ZP:function(){return w}});var r=i(3366),t=i(7462),a=i(7294),s=i(6010),c=i(9766),o=i(8528);const l=["sx"];function d(e){const{sx:n}=e,i=(0,r.Z)(e,l),{systemProps:a,otherProps:s}=(e=>{const n={systemProps:{},otherProps:{}};return Object.keys(e).forEach((i=>{o.G[i]?n.systemProps[i]=e[i]:n.otherProps[i]=e[i]})),n})(i);let d;return d=Array.isArray(n)?[a,...n]:"function"===typeof n?(...e)=>{const i=n(...e);return(0,c.P)(i)?(0,t.Z)({},a,i):a}:(0,t.Z)({},a,n),(0,t.Z)({},s,{sx:d})}var m=i(5408),u=i(7192),p=i(1509),h=i(8010);var g=a.createContext(),x=i(3620);function f(e){return(0,x.Z)("MuiGrid",e)}const _=["auto",!0,1,2,3,4,5,6,7,8,9,10,11,12];var j=(0,i(6087).Z)("MuiGrid",["root","container","item","zeroMinWidth",...[0,1,2,3,4,5,6,7,8,9,10].map((e=>`spacing-xs-${e}`)),...["column-reverse","column","row-reverse","row"].map((e=>`direction-xs-${e}`)),...["nowrap","wrap-reverse","wrap"].map((e=>`wrap-xs-${e}`)),..._.map((e=>`grid-xs-${e}`)),..._.map((e=>`grid-sm-${e}`)),..._.map((e=>`grid-md-${e}`)),..._.map((e=>`grid-lg-${e}`)),..._.map((e=>`grid-xl-${e}`))]),N=i(5893);const S=["className","columns","columnSpacing","component","container","direction","item","lg","md","rowSpacing","sm","spacing","wrap","xl","xs","zeroMinWidth"];function y(e){const n=parseFloat(e);return`${n}${String(e).replace(String(n),"")||"px"}`}function v(e,n,i={}){if(!n||!e||e<=0)return[];if("string"===typeof e&&!Number.isNaN(Number(e))||"number"===typeof e)return[i[`spacing-xs-${String(e)}`]||`spacing-xs-${String(e)}`];const{xs:r,sm:t,md:a,lg:s,xl:c}=e;return[Number(r)>0&&(i[`spacing-xs-${String(r)}`]||`spacing-xs-${String(r)}`),Number(t)>0&&(i[`spacing-sm-${String(t)}`]||`spacing-sm-${String(t)}`),Number(a)>0&&(i[`spacing-md-${String(a)}`]||`spacing-md-${String(a)}`),Number(s)>0&&(i[`spacing-lg-${String(s)}`]||`spacing-lg-${String(s)}`),Number(c)>0&&(i[`spacing-xl-${String(c)}`]||`spacing-xl-${String(c)}`)]}const k=(0,p.ZP)("div",{name:"MuiGrid",slot:"Root",overridesResolver:(e,n)=>{const{container:i,direction:r,item:t,lg:a,md:s,sm:c,spacing:o,wrap:l,xl:d,xs:m,zeroMinWidth:u}=e.ownerState;return[n.root,i&&n.container,t&&n.item,u&&n.zeroMinWidth,...v(o,i,n),"row"!==r&&n[`direction-xs-${String(r)}`],"wrap"!==l&&n[`wrap-xs-${String(l)}`],!1!==m&&n[`grid-xs-${String(m)}`],!1!==c&&n[`grid-sm-${String(c)}`],!1!==s&&n[`grid-md-${String(s)}`],!1!==a&&n[`grid-lg-${String(a)}`],!1!==d&&n[`grid-xl-${String(d)}`]]}})((({ownerState:e})=>(0,t.Z)({boxSizing:"border-box"},e.container&&{display:"flex",flexWrap:"wrap",width:"100%"},e.item&&{margin:0},e.zeroMinWidth&&{minWidth:0},"wrap"!==e.wrap&&{flexWrap:e.wrap})),(function({theme:e,ownerState:n}){const i=(0,m.P$)({values:n.direction,breakpoints:e.breakpoints.values});return(0,m.k9)({theme:e},i,(e=>{const n={flexDirection:e};return 0===e.indexOf("column")&&(n[`& > .${j.item}`]={maxWidth:"none"}),n}))}),(function({theme:e,ownerState:n}){const{container:i,rowSpacing:r}=n;let t={};if(i&&0!==r){const n=(0,m.P$)({values:r,breakpoints:e.breakpoints.values});t=(0,m.k9)({theme:e},n,(n=>{const i=e.spacing(n);return"0px"!==i?{marginTop:`-${y(i)}`,[`& > .${j.item}`]:{paddingTop:y(i)}}:{}}))}return t}),(function({theme:e,ownerState:n}){const{container:i,columnSpacing:r}=n;let t={};if(i&&0!==r){const n=(0,m.P$)({values:r,breakpoints:e.breakpoints.values});t=(0,m.k9)({theme:e},n,(n=>{const i=e.spacing(n);return"0px"!==i?{width:`calc(100% + ${y(i)})`,marginLeft:`-${y(i)}`,[`& > .${j.item}`]:{paddingLeft:y(i)}}:{}}))}return t}),(function({theme:e,ownerState:n}){let i;return e.breakpoints.keys.reduce(((r,a)=>{let s={};if(n[a]&&(i=n[a]),!i)return r;if(!0===i)s={flexBasis:0,flexGrow:1,maxWidth:"100%"};else if("auto"===i)s={flexBasis:"auto",flexGrow:0,flexShrink:0,maxWidth:"none",width:"auto"};else{const c=(0,m.P$)({values:n.columns,breakpoints:e.breakpoints.values}),o="object"===typeof c?c[a]:c;if(void 0===o||null===o)return r;const l=Math.round(i/o*1e8)/1e6+"%";let d={};if(n.container&&n.item&&0!==n.columnSpacing){const i=e.spacing(n.columnSpacing);if("0px"!==i){const e=`calc(${l} + ${y(i)})`;d={flexBasis:e,maxWidth:e}}}s=(0,t.Z)({flexBasis:l,flexGrow:0,maxWidth:l},d)}return 0===e.breakpoints.values[a]?Object.assign(r,s):r[e.breakpoints.up(a)]=s,r}),{})}));var w=a.forwardRef((function(e,n){const i=d((0,h.Z)({props:e,name:"MuiGrid"})),{className:c,columns:o,columnSpacing:l,component:m="div",container:p=!1,direction:x="row",item:_=!1,lg:j=!1,md:y=!1,rowSpacing:w,sm:b=!1,spacing:$=0,wrap:P="wrap",xl:C=!1,xs:Z=!1,zeroMinWidth:M=!1}=i,H=(0,r.Z)(i,S),I=w||$,T=l||$,W=a.useContext(g),B=o||W||12,z=(0,t.Z)({},i,{columns:B,container:p,direction:x,item:_,lg:j,md:y,sm:b,rowSpacing:I,columnSpacing:T,wrap:P,xl:C,xs:Z,zeroMinWidth:M}),R=(e=>{const{classes:n,container:i,direction:r,item:t,lg:a,md:s,sm:c,spacing:o,wrap:l,xl:d,xs:m,zeroMinWidth:p}=e,h={root:["root",i&&"container",t&&"item",p&&"zeroMinWidth",...v(o,i),"row"!==r&&`direction-xs-${String(r)}`,"wrap"!==l&&`wrap-xs-${String(l)}`,!1!==m&&`grid-xs-${String(m)}`,!1!==c&&`grid-sm-${String(c)}`,!1!==s&&`grid-md-${String(s)}`,!1!==a&&`grid-lg-${String(a)}`,!1!==d&&`grid-xl-${String(d)}`]};return(0,u.Z)(h,f,n)})(z);return D=(0,N.jsx)(k,(0,t.Z)({ownerState:z,className:(0,s.Z)(R.root,c),as:m,ref:n},H)),12!==B?(0,N.jsx)(g.Provider,{value:B,children:D}):D;var D}))},8581:function(e,n,i){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return i(3678)}])},8050:function(e,n,i){"use strict";i.d(n,{Z:function(){return _}});var r=i(5893),t=i(9008),a=i(1389),s=i.n(a),c=i(5794),o=i.n(c),l=i(218),d=i(1078),m=i(682),u=i(1664),p=i(7911),h=i.n(p),g=i(3750);function x(){return(0,r.jsx)(l.Z,{bg:"light",expand:"lg",fixed:"top",children:(0,r.jsxs)(m.Z,{fluid:!0,children:[(0,r.jsx)(l.Z.Brand,{children:(0,r.jsx)(u.default,{href:"/",children:(0,r.jsxs)("a",{className:h().navLink,children:[(0,r.jsx)(g.SX3,{})," Home"]})})}),(0,r.jsx)(l.Z.Toggle,{"aria-controls":"navbarScroll"}),(0,r.jsx)(l.Z.Collapse,{id:"navbarScroll",className:"justify-content-end",children:(0,r.jsxs)(d.Z,{children:[(0,r.jsx)(d.Z.Item,{className:"my-2",children:(0,r.jsx)(u.default,{href:"/publication",children:(0,r.jsxs)("a",{className:h().navLink,children:[(0,r.jsx)(g.VLk,{})," Publication"]})})}),(0,r.jsx)(d.Z.Item,{className:"my-2",children:(0,r.jsx)(u.default,{href:"/education",children:(0,r.jsxs)("a",{className:h().navLink,children:[(0,r.jsx)(g.DC2,{})," Education"]})})}),(0,r.jsx)(d.Z.Item,{className:"my-2",children:(0,r.jsx)(u.default,{href:"/project",children:(0,r.jsxs)("a",{className:h().navLink,children:[(0,r.jsx)(g._S5,{})," Project"]})})})]})})]})})}var f="Chuanyu Pan (\u6f58\u4f20\u5b87)";function _(e){var n=e.children;return(0,r.jsxs)("div",{className:s().background,children:[(0,r.jsxs)(t.default,{children:[(0,r.jsx)("title",{children:"Chuanyu Pan"}),(0,r.jsx)("meta",{name:"keywords",content:"ChuanyuPan, \u6f58\u4f20\u5b87, Chuanyu, Tsinghua, \u6e05\u534e"}),(0,r.jsx)("meta",{name:"description",content:"This page is Chuanyu Pan's home page."}),(0,r.jsx)("meta",{name:"author",content:"Chuanyu Pan \u6f58\u4f20\u5b87"}),(0,r.jsx)("meta",{"http-equiv":"content-Type",content:"text/html; charset=utf-8"}),(0,r.jsx)("meta",{name:"google-site-verification",content:"RisFS-DjchuTNwiHmyLFchX4R3TSW4H2DcU57Zza9d0"})]}),(0,r.jsx)(x,{}),(0,r.jsxs)("div",{className:s().container,children:[(0,r.jsxs)("header",{className:s().header,children:[(0,r.jsx)("img",{src:"/images/profile.jpg",className:"".concat(s().headerHomeImage," ").concat(o().borderCircle),alt:f}),(0,r.jsx)("h1",{className:o().heading2Xl,children:f})]}),(0,r.jsx)("main",{children:n}),(0,r.jsx)("footer",{className:s().footer,children:(0,r.jsx)("p",{children:"\xa9 2023 Chuanyu Pan. All rights reserved."})})]})]})}},3678:function(e,n,i){"use strict";i.r(n),i.d(n,{default:function(){return u}});var r=i(5893),t=i(8050),a=i(214),s=i.n(a),c=i(5794),o=i.n(c),l=i(3750),d=i(1664),m=i(9162);function u(){return(0,r.jsx)("div",{children:(0,r.jsx)(t.Z,{children:(0,r.jsxs)("section",{className:o().headingMd,children:[(0,r.jsxs)("section",{className:s().sectioncard,children:[(0,r.jsx)("h2",{className:s().sectiontitle,children:"About me"}),(0,r.jsx)("p",{className:"".concat(s().intropara," ").concat(s().introtext),children:"Hi, I am currently an MEng student in the department of Electronic Engineering and Computer Science at UC Berkeley. Before joining UCBerkeley, I received my bachelor's degree in Computer Science and Technology at Tsinghua University (Beijing, China). My professional and research interest lies in Computer Graphics and 3D Vision, aiming to enhance machines' 3D perception and create Mixed Reality. My research areas include 3D object tracking, 3D reconstruction, and avatar creation. I would like to explore more interesting areas in 3D in the future!"}),(0,r.jsxs)("p",{className:s().intropara,children:[(0,r.jsx)(l.HHm,{}),"\xa0\xa0 Master Student of EECS, University of California Berkeley"]}),(0,r.jsxs)("p",{className:s().intropara,children:[(0,r.jsx)(l.B06,{}),"\xa0\xa0  Berkeley, California, United States"]}),(0,r.jsxs)("p",{className:s().intropara,children:[(0,r.jsx)(l.cIw,{}),"\xa0\xa0  chuanyu_pan@berkeley.edu"]}),(0,r.jsxs)("p",{className:s().intropara,children:[(0,r.jsx)(l.I30,{}),"\xa0\xa0  Research Interest: 3D Computer Vision, Computer Graphics, VR/AR/MR"]}),(0,r.jsxs)("ul",{className:s().iconpara,children:[(0,r.jsx)("span",{className:s().iconlink,children:(0,r.jsx)("a",{href:"https://github.com/pptrick",className:s().link,children:(0,r.jsx)(l.rFR,{size:23})})}),(0,r.jsx)("span",{className:s().iconlink,children:(0,r.jsx)("a",{href:"https://scholar.google.com/citations?user=wNKoPGAAAAAJ&hl=en",className:s().link,children:(0,r.jsx)(l.VyK,{size:23})})}),(0,r.jsx)("span",{className:s().iconlink,children:(0,r.jsx)("a",{href:"https://www.linkedin.com/in/chuanyu-pan/",className:s().link,children:(0,r.jsx)(l.NQh,{size:23})})})]})]}),(0,r.jsx)(d.default,{href:"/publication",children:(0,r.jsxs)("section",{className:s().sectioncard,children:[(0,r.jsx)("h2",{className:s().sectiontitle,children:"Publication"}),(0,r.jsxs)(m.ZP,{container:!0,spacing:2,className:s().intropara,children:[(0,r.jsxs)(m.ZP,{item:!0,xs:4,children:[" ",(0,r.jsx)("img",{src:"/images/pubimg.png",className:s().image,alt:"pubimg"})]}),(0,r.jsxs)(m.ZP,{item:!0,xs:8,children:[" ",(0,r.jsx)("p",{className:s().imagetext,children:"My research interests mainly lies in 3D vision and computer graphics, and I have publications on top conferences like CVPR, ICLR, etc. I had experience on 3D reconstruction and perception, and hope to investigate more in these fields."})]})]})]})}),(0,r.jsx)(d.default,{href:"/education",children:(0,r.jsxs)("section",{className:s().sectioncard,children:[(0,r.jsx)("h2",{className:s().sectiontitle,children:"Education"}),(0,r.jsxs)(m.ZP,{container:!0,spacing:2,className:s().intropara,children:[(0,r.jsxs)(m.ZP,{item:!0,xs:4,children:[" ",(0,r.jsx)("img",{src:"/images/eduimg.png",className:s().image,alt:"pubimg"})]}),(0,r.jsxs)(m.ZP,{item:!0,xs:8,children:[" ",(0,r.jsx)("p",{className:s().imagetext,children:"I'm currently a master student at UC Berkeley, major in computer Science (visual computing and computer graphics). Before joining berkeley, I received my bachelor's degree in Computer Science and Technology at Tsinghua University (Beijing, China)."})]})]})]})})]})})})}},214:function(e){e.exports={intropara:"Home_intropara__3owtp",introtext:"Home_introtext__Q7UXV",iconpara:"Home_iconpara__CUiqN",iconlink:"Home_iconlink__a_sgM",link:"Home_link__mt0ji",sectioncard:"Home_sectioncard__vPYHK",sectiontitle:"Home_sectiontitle__YG2ob",image:"Home_image__yn5pu",imagetext:"Home_imagetext__IfHhr"}},7911:function(e){e.exports={navLink:"Nav_navLink__4uUt6"}},1389:function(e){e.exports={container:"layout_container__5R52X",header:"layout_header__H1FPN",headerImage:"layout_headerImage__m3cc7",headerHomeImage:"layout_headerHomeImage__jaw_C",backToHome:"layout_backToHome__tn1X1",footer:"layout_footer__a_vOy",background:"layout_background__MrGMB"}},5794:function(e){e.exports={heading2Xl:"utils_heading2Xl___9fFP",headingXl:"utils_headingXl__u25Y2",headingLg:"utils_headingLg__5535D",headingMd:"utils_headingMd__gD1Ok",borderCircle:"utils_borderCircle__s2nTm",colorInherit:"utils_colorInherit__mSH_x",padding1px:"utils_padding1px__PWQKR",list:"utils_list__4Mu4l",listItem:"utils_listItem__s2m6i",lightText:"utils_lightText__eUzGY"}}},function(e){e.O(0,[13,84,774,888,179],(function(){return n=8581,e(e.s=n);var n}));var n=e.O();_N_E=n}]);