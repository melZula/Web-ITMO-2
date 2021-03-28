const APIkey = '31568c74ca98c06f4846aaf5ed73a884'

document.querySelector('.fv form').addEventListener('submit', addFavorite)

function getWeather(latitude, longitude) {
    let mainTemplate = document.querySelector('template.main')
    let mainCity = document.importNode(mainTemplate.content, true)
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
            let propsNode = setPropsList(r)
            return propsNode
        }
    ).then(
        (propsNode) => {
            document.getElementById('main').appendChild(mainCity)
            document.getElementById('props-main').appendChild(propsNode)
            loaders.map((l) => { l.style.display = 'none' })
        }
    ).catch(
        (e) => { alert(e) }
    )
}

function setPropsList(data) {
    let propsTemplate = document.querySelector('template.props')
    let propsNode = document.importNode(propsTemplate.content, true)
    let propsList = propsNode.querySelectorAll('li span:last-child')
    propsList[0].textContent = data.wind.speed + ' m/s'
    propsList[1].textContent = data.weather[0].description
    propsList[2].textContent = data.main.pressure + 'hpa'
    propsList[3].textContent = data.main.humidity + '%'
    propsList[4].textContent = '[' + data.coord.lon + ', ' + data.coord.lat + ']'
    return propsNode
}

function getLocation() {
    let options = {
        maximumAge: 60000,
        timeout: 10000,
        enableHighAccuracy: false
    };
    loaders = Array.from(document.getElementsByClassName("loader"))
    loaders.map((l) => { l.style.display = 'flex' })
    dataElements = Array.from(document.getElementsByClassName("data"))
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            getWeather(pos.coords.latitude, pos.coords.longitude)
        },
            (err) => { getWeather(55.7522200, 37.6155600) },
            options);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

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
        localStorage.getItem('fv') ?? localStorage.setItem('fv', '')
        fvs = localStorage.getItem('fv')
        localStorage.setItem('fv', fvs + ' ' + event.target.elements[0].value)
        getFavoriteWeather(event.target.elements[0].value)
    }).catch((e) => {
        alert(e)
    })
}

function getFavoriteWeather(sityName) {
    let fvTemplate = document.querySelector('template.fv')
    let fvCard = document.importNode(fvTemplate.content, true)
    let url = new URL('http://api.openweathermap.org/data/2.5/weather')
    params = {
        'q': sityName,
        'appid': APIkey,
        'units': 'metric'
    }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url).then((response) => {
        if (response.ok) {
            return response.json()
        } else {
            return Promise.reject(response.status)
        }
    }).then((r) => {
        fvCard.querySelector('h3').textContent = sityName
        fvCard.querySelector('.fvheader span').textContent = r.main.temp + '°'
        let propsNode = setPropsList(r)
        return propsNode
    }).then((propsNode) => {
        fvCard.querySelector('.favorite').appendChild(propsNode)
        document.getElementsByClassName('favorites')[0].appendChild(fvCard)
    })
}

getLocation()
let fvList = localStorage.getItem('fv')
if (fvList !== null && fvList !== undefined) {
    fvList.split(' ').forEach((sityName) => {
        getFavoriteWeather(sityName)
    });
}