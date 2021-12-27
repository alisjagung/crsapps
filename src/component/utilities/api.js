import axios from "axios";
export const Api = url =>
{
    var apiURL = url;

    const getData = (data, config) =>
    {
        return new Promise((resolve,reject) => 
        {
            axios.get(apiURL, config)
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

    const postData = (data, config) =>
    {
        return new Promise((resolve,reject) => 
        {
            axios.post(apiURL, data, config)
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

    return{
        getApi : (data, config) => getData(data, config),
        postApi : (data, config) => postData(data, config)
    }

}