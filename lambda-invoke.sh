
aws lambda update-function-configuration --function-name ImageResize-v1-resize --timeout 30


aws lambda invoke \
--payload file://invoke-payload.json \
--function-name ImageResize-v1-resize \
--cli-binary-format raw-in-base64-out \
response.json


https://sharp.pixelplumbing.com/install#aws-lambda
npm install
rm -rf node_modules/sharp
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --arch=x64 --platform=linux --libc=glibc sharp


// Manual ddploy
npm i --save uuid
npm i --save sharp
zip -r deploy.zip ./
aws lambda update-function-code --function-name ImageResize-v1-resize --zip-file fileb://deploy.zip
-> ต้องไป publish new version บน aws ด้วย!



aws lambda create-function --function-name ImageResize-v1-resize \
--zip-file fileb://deploy.zip --handler handler.resize --runtime nodejs12.x \
--timeout 30 --memory-size 1024 \
--role arn:aws:iam::123456789:role/lambda-s3-role