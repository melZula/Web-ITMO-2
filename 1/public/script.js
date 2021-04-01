const APIkey = '31568c74ca98c06f4846aaf5ed73a884'

document.querySelector('.fv form').addEventListener('submit', addFavorite)
document.querySelector('button.update').addEventListener('click', getLocation)

function getWeather (latitude, longitude) {
  const mainTemplate = document.querySelector('template.main')
  const mainCity = document.importNode(mainTemplate.content, true)
  const url = new URL('https://api.openweathermap.org/data/2.5/weather')
  const params = {
    lat: latitude,
    lon: longitude,
    appid: APIkey,
    units: 'metric'
  }
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))
  window.fetch(url).then(
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
      mainCity.querySelector('img').src = 'https://openweathermap.org/img/wn/' + r.weather[0].icon + '@4x.png'
      const propsNode = setPropsList(r)
      return propsNode
    }
  ).then(
    (propsNode) => {
      document.getElementById('main').appendChild(mainCity)
      document.getElementById('props-main').appendChild(propsNode)
      document.querySelector('main .loader').remove()
    }
  ).catch(
    (e) => { window.alert(e) }
  )
}

function reloadMainLoader () {
  if (document.querySelector('#props-main')) {
    while (document.querySelector('#main').hasChildNodes()) {
      document.querySelector('#main').firstChild.remove()
    }
  }
  enableLoader(document, '#main')
}

function setPropsList (data) {
  const propsTemplate = document.querySelector('template.props')
  const propsNode = document.importNode(propsTemplate.content, true)
  const propsList = propsNode.querySelectorAll('li span:last-child')
  propsList[0].textContent = data.wind.speed + ' m/s'
  propsList[1].textContent = data.weather[0].description
  propsList[2].textContent = data.main.pressure + 'hpa'
  propsList[3].textContent = data.main.humidity + '%'
  propsList[4].textContent = '[' + data.coord.lon + ', ' + data.coord.lat + ']'
  return propsNode
}

function getLocation () {
  reloadMainLoader()
  const options = {
    maximumAge: 600000,
    timeout: 10000,
    enableHighAccuracy: false
  }
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      getWeather(pos.coords.latitude, pos.coords.longitude)
    },
    () => { getWeather(55.7522200, 37.6155600) },
    options)
  } else {
    console.log('Geolocation is not supported by this browser.')
  }
}

function addFavorite (event) {
  const url = new URL('https://api.openweathermap.org/data/2.5/weather')
  const params = {
    q: event.target.elements[0].value,
    appid: APIkey,
    units: 'metric'
  }
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
  window.fetch(url).then((response) => {
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
    window.localStorage.getItem('fv') ?? window.localStorage.setItem('fv', '')
    const fvs = window.localStorage.getItem('fv')
    window.localStorage.setItem('fv', fvs + event.target.elements[0].value + ';')
    getFavoriteWeather(event.target.elements[0].value)
    event.target.elements[0].value = ''
  }).catch((e) => {
    window.alert(e)
  })
}

function getFavoriteWeather (sityName) {
  const fvTemplate = document.querySelector('template.fv')
  let fvCard = document.importNode(fvTemplate.content, true)
  const url = new URL('https://api.openweathermap.org/data/2.5/weather')
  const sityNameTrimmed = sityName.replace(/\s/g, '')
  fvCard.querySelector('.favorite').id = sityNameTrimmed
  fvCard.querySelector('h3').textContent = sityName
  enableLoader(fvCard, '.favorite')
  document.getElementsByClassName('favorites')[0].appendChild(fvCard)
  fvCard = document.querySelector(`#${sityNameTrimmed}`)
  const params = {
    q: sityName,
    appid: APIkey,
    units: 'metric'
  }
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
  window.fetch(url).then((response) => {
    if (response.ok) {
      return response.json()
    } else {
      return Promise.reject(response.status)
    }
  }).then((r) => {
    fvCard.querySelector('.fvheader span').textContent = r.main.temp + '°'
    fvCard.querySelector('img').src = 'https://openweathermap.org/img/wn/' + r.weather[0].icon + '@4x.png'
    const propsNode = setPropsList(r)
    return propsNode
  }).then((propsNode) => {
    fvCard.querySelector('.loader').remove()
    fvCard.appendChild(propsNode)
    fvCard.querySelector('button').addEventListener('click', () => {
      fvCard.parentNode.removeChild(fvCard)
      const fvList = window.localStorage.getItem('fv')
      window.localStorage.setItem('fv', fvList.replace(sityName + ';', ''))
    })
  }).catch((e) => {
    console.log(e)
  })
}

function enableLoader (node, selector) {
  const loaderTemplate = document.querySelector('template.loader')
  const loader = document.importNode(loaderTemplate.content, true)
  node.querySelector(selector).appendChild(loader)
}

getLocation()

const fvList = window.localStorage.getItem('fv')
if (fvList !== null && fvList !== undefined) {
  fvList.split(';').forEach((sityName) => {
    if (sityName !== '') {
      getFavoriteWeather(sityName)
    }
  })
}
