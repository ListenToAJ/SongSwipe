$(document).ready(async function () {
    let button = document.getElementById('login');
    button.addEventListener('click', () => {
        document.location.replace(`${API_URI}/auth/login`)
    })
});
