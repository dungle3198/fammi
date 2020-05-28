import S3 from 'react-aws-s3';

const config = {
    bucketName: 'unknown2020',
    region: 'ap-southeast-1',
    accessKeyId: "AKIAJV3GPQ7VQQOXRCDQ",
    secretAccessKey: "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",
}
const ReactS3Client = new S3(config);
const uploadImages = (file) => {
    var path = file.name;
    var filename = path.split('/');
    ReactS3Client
        .uploadFile(file,filename)
        .then(data => console.log(data))
        .catch(err => console.error(err))
}
export {uploadImages,ReactS3Client}