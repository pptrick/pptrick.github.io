echo "===================Deploy Preparations Started======================"
npm run build
npm run export
cp ./.nojekyll ./out
cd ..
echo "===================Deploy Preparations Finished====================="
git status