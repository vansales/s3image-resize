'use strict';

const AWS = require('aws-sdk');
const util = require('util');
const sharp = require('sharp');

// get reference to S3 client
const s3 = new AWS.S3();

module.exports.resize = async (event, context, callback) => {

  // Read options from the event parameter.
  console.log("Reading options from event:\n", util.inspect(event, { depth: 5 }));
  const srcBucket = event.Records[0].s3.bucket.name;
  // Object key may have spaces or unicode non-ASCII characters.
  const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  const dstBucket = srcBucket;
  const dstKey = 'resized/' + srcKey;

  // Infer the image type from the file suffix.
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.log("Could not determine the image type.");
    return "Could not determine the image type.";
  }

  // Check that the image type is supported
  const imageType = typeMatch[1].toLowerCase();
  if (imageType != "jpg" && imageType != 'jpeg' && imageType != "png") {
    console.log(`Unsupported image type: ${imageType}`);
    return `Unsupported image type: ${imageType}`;
  }

  // Download the image from the S3 source bucket.

  try {
    const params = {
      Bucket: srcBucket,
      Key: srcKey
    };
    var origimage = await s3.getObject(params).promise();

  } catch (error) {
    console.log(error);
    return error;
  }

  // set thumbnail width. Resize will set the height automatically to maintain aspect ratio.
  const width = 200;
  const height = 200;

  // Use the sharp module to resize the image and save in a buffer.
  try {

    // var buffer = await sharp(origimage.Body).resize(width).toBuffer();
    var buffer = await sharp(origimage.Body)
      .resize({
        width: width,
        height: height,
        fit: sharp.fit.cover, // crop
        position: sharp.strategy.entropy
      }).toBuffer();

  } catch (error) {
    console.log(error);
    return error;
  }

  // Upload the thumbnail image to the destination bucket
  try {
    const destparams = {
      Bucket: dstBucket,
      Key: dstKey,
      Body: buffer,
      ContentType: 'image',
      ACL: 'public-read'
    };


    const putResult = await s3.putObject(destparams).promise();

  } catch (error) {
    console.log(error);
    return error;
  }

  console.log('Successfully resized');
  return 'Successfully resized ';

};
