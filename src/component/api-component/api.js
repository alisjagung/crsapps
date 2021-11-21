import axios from "axios";

export function getData(url, data, apiParams) 
{
    return new Promise((resolve,reject) => 
    {
        axios.get(url, {params : apiParams})
        .then(response => 
            {
                if(response.status === 200)
                {
                    resolve(response.data);
                }
                else
                {
                    reject(response);
                }
            })
        .catch(error => 
            {
                reject(error);
            })
    })
}