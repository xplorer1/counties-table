const preRegister = () => {
    const email = document.getElementById('inputEmail').value;
    
    if(!email){
        toastr.error('Please Input an email');
        return;
    }
    const body = JSON.stringify({email});

    console.log(body);
    
    fetch('https://streameats.com.ng/api/user/pre_sign_up', {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json'
        },
        body
    })
    .then(res => {
        return res.json();
    })
    .then(res => {
        console.log(res)
        if(res.status == '200'){
            document.getElementById('content').style.display = 'none';
            document.getElementById('congrats').style.display = 'block';
            return toastr.success('success')
        }
        toastr.error(res.message);
    }).catch(e => {
        console.log(e.message);
        toastr.error(e.message);
    });
};


const button = document.getElementById('submitEmail');

button.addEventListener('click', preRegister);