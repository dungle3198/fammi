import S3 from 'react-aws-s3';

const config = {
    bucketName: 'unknown2020',
    region: 'ap-southeast-1',
    accessKeyId: "AKIA2MHOP7MJZNAD5XMR",
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