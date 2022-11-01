const form = document.getElementById("uploadForm");

const sendFiles = async () => {
    let start = Date.now();
    const files = document.getElementById("inputFiles").files;

    const formData = new FormData();

    Object.keys(files).forEach(key => {
        formData.append('photos', files.item(key))
    })

    const response = await fetch('/upload', {
        method: "POST",
        body: formData
    })

    const json = await response.json()
    let timing = Date.now() - start;

    const h2 = document.querySelector('h2')
    h2.textContent = `Status: ${json?.status}`

    const h3 = document.querySelector('h3')
    h3.textContent = json?.message

    const p = document.querySelector('p')
    p.textContent = `${timing} ms`

    const img = document.querySelector('img')
    img.src = `data:image/jpeg;base64,${json?.message[0]}`

    console.log(json)
}

form.addEventListener('submit', (e) => {
    e.preventDefault()
    sendFiles()
})