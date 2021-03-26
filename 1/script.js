const APIkey = '31568c74ca98c06f4846aaf5ed73a884'

document.querySelector('.fv form').addEventListener('submit', addFavorite)

function getWeather(latitude, longitude) {
    let mainTemplate = document.querySelector('template.main')
    let mainCity = document.importNode(mainTemplate.content, true)
    let propsTemplate = document.querySelector('template.props')
    let propsNode = document.importNode(propsTemplate.content, true)
    let propsList = propsNode.querySelectorAll('li span:last-child')
    let url = new URL('http://api.openweathermap.org/data/2.5/weather')
    params = {
        'lat': latitude,
        'lon': longitude,
        'appid': APIkey,
        'units': 'metric'
    }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url).then(
        (response) => {
            if (response.ok) {
                return response.json()
            } else {
                return Promise.reject(response.status)
            }
        }
    ).then(
        (r) => {
            mainCity.querySelector('h2').textContent = r.name
            mainCity.querySelector('span').textContent = r.main.temp + '°'
            mainCity.querySelector('img').src = 'http://openweathermap.org/img/wn/' + r.weather[0].icon + '@4x.png'
            propsList[0].textContent = r.wind.speed + ' m/s'
            propsList[1].textContent = r.weather[0].description
            propsList[2].textContent = r.main.pressure + 'hpa'
            propsList[3].textContent = r.main.humidity + '%'
            propsList[4].textContent = '[' + r.coord.lon + ', ' + r.coord.lat + ']'
        }
    ).then(
        () => {
            document.getElementById('main').appendChild(mainCity)
            document.getElementById('props-main').appendChild(propsNode)
            loaders.map((l) => { l.style.display = 'none' })
        }
    ).catch(
        (e) => { alert(e) }
    )
}

function getLocation() {
    let options = {
        maximumAge: 60000,
        timeout: 10000,
        enableHighAccuracy: false
    };
    loaders = Array.from(document.getElementsByClassName("loader"))
    dataElements = Array.from(document.getElementsByClassName("data"))
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            loaders.map((l) => { l.style.display = 'flex' })
            getWeather(pos.coords.latitude, pos.coords.longitude)
        },
            (err) => { getWeather(55.7522200, 37.6155600) },
            options);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}
getLocation()


function addFavorite(event) {
    let url = new URL('http://api.openweathermap.org/data/2.5/weather')
    params = {
        'q': event.target.elements[0].value,
        'appid': APIkey,
        'units': 'metric'
    }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url).then((response) => {
        if (response.ok) {
            return response.json()
        } else {
            if (response.status === 404) {
                event.target.elements[0].style.border = '2px'
                event.target.elements[0].style.borderColor = 'red'
            }
            return Promise.reject(response.status)
        }
    }).then((r) => {
        localStorage.getItem("fv") ?? localStorage.setItem('fv', '{[]}')
        localStorage.setItem('fv', event.target.elements[0].value)
    }).catch((e) => {
        alert(e)
    })
}