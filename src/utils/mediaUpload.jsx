const url="https://tzzoxmshgytmtpxgentt.supabase.co"; 
const key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6em94bXNoZ3l0bXRweGdlbnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MTMyNzMsImV4cCI6MjA5ODM4OTI3M30.E5Xq7eZ0nwl9LuG2_wJfHzJePYUZJe55eCW6WZ2xLqU";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(url,key);

export default function uploadFile(file){
    const promise = new Promise(
        (resolve,reject)=>{

            if(file==null){
                reject("Please select a file to upload");
                return;
            }
            const timeStamp = new Date().getTime();
            const fileName = timeStamp+"-"+file.name;

            supabase.storage.from("images").upload(fileName,file,{
                cacheControl:"3600",
                upset:false
            }).then(
                ()=>{
                    const publicUrl = supabase.storage.from("images").getPublicUrl(fileName).data.publicUrl;
                    resolve(publicUrl);
                }
            ).catch(
                ()=>{
                    
                    reject("Failed to upload file");

                }
            )
        }
    )
        return promise;
    

}