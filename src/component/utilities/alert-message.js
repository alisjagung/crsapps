import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import 'react-toastify/dist/ReactToastify.minimal.css';

export default function AlertMessage()
{
    const showError = (err) =>
    {
        toast.error(err, {
            position: "top-right",
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme:'colored'
            });
    }

    const showSuccess = (response) =>
    {
        toast.success(response, {
            position: "top-right",
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme:'colored'
            });
    }

    return{
        showSuccess: (response) => showSuccess(response),
        showError: (err) => showError(err)
    }
}