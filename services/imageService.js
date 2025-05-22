import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';

export const uploadFile = async (folderName, fileUri, isImage=true)=>{
    try{
        let fileName = getFilePath(folderName, isImage);
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri,{
            encoding: FileSystem.EncodingType.Base64
        });

        let imageData = decode(fileBase64);
        let {data, error} = await supabase
        .storage
        .from('art-images')
        .upload(fileName, imageData,{
            cacheControl: '3600',
            upsert: false,
            contentType: isImage? 'image/*':'image/*'
        })
        if(error){
            console.log('File upload error: ', error);
            return {success: false, msg: 'Could not upload media'};
        }

        console.log('file upload error:', error);
        return {success: true, data: data.path}
    }catch(error){
        console.log('File upload error: ', error);
        return {success: false, msg: 'Could not upload media'};
    }
}

export const getFilePath = (folderName, isImage)=>{
    return `/${folderName}/${(new Date()).getTime()}${isImage? '.png':'jpg'}`;
}