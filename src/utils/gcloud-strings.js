export const getGcloudBucketHelphiveUsersUrl = (profile) => {
    const bucketName = import.meta.env.VITE_PUBLIC_GCLOUD_BUCKET_HELPHIVE_USERS || "";
    return `https://storage.googleapis.com/${bucketName}/${profile}`;
};
