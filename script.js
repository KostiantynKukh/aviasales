// get elements from html
const d = document;
const inputCitiesFrom = d.querySelector(".input__cities-from"),
      dropdownCitiesFrom = d.querySelector(".dropdown__cities-from"),
      inputCitiesTo = d.querySelector(".input__cities-to"),
      dropdownCitiesTo = d.querySelector('.dropdown__cities-to'),
      formSearch = d.querySelector(".form-search"),
      inputDateDepart = d.querySelector('.input__date-depart'),
      cheapestTicket = d.getElementById('cheapest-ticket'),
      otherCheapTickets = d.getElementById('other-cheap-tickets'),
      alertFrom = d.querySelector('.alert_from'),
      alertTo = d.querySelector('.alert_to');
      
//data
const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json', //'./dataBase/cities.json',
      proxy = 'https://cors-anywhere.herokuapp.com/',
      API_KEY = "77bdac0675b28498e1bbe19f096d9fd3",
      calendarApi = "http://min-prices.aviasales.ru/calendar_preload",
      maxCount = 10;

let city = [];

// functions
const getData = (url, callback, reject = console.error) => {
    const request = new XMLHttpRequest();

    request.open('GET', url);

    request.addEventListener('readystatechange', () => {
        if (request.readyState !==4) return;

        if (request.status === 200){
            callback(request.response);
        } else {
            reject(request.status);
        }
    });
    request.send();
};

const showCity = function (input, list) {
    list.textContent = '';
    if(input.value === "") return;

    const filterCity = city.filter((item) => {
        
            const fixItem = item.name.toLowerCase();
            const fixValue = input.value.toLowerCase();
            return fixItem.startsWith(fixValue);
        
    })
    filterCity.forEach((item) => {
        const li = d.createElement("li");
        li.textContent = item.name;
        li.classList.add("dropdown__city");
        list.append(li);
    })
}

const chooseCity = function (input, list, event) {
    const target = event.target;
    
    if (target.tagName.toLowerCase() === "li"){
        input.value = target.textContent;
        list.textContent = '';
    }
}

const getLinkAviasales = (data) => {
    let link = 'https://www.aviasales.ru/search/';
    link += data.origin;
    const date = new Date(data.depart_date);
    const day = date.getDate();
    link += day < 10 ? '0' + day : day;
    const month = date.getMonth() + 1;
    link += month < 10 ? '0' + month : month;
    link += data.destination;
    return link + 1;
}

const hideDropwown = (event) => {
    let targetClass = event.target.classList.value;
    if (targetClass === 'input__cities-from') {
        dropdownCitiesTo.style.display = 'none';
        dropdownCitiesFrom.style.display = 'block';
    }  else if (targetClass === 'input__cities-to') {
        dropdownCitiesFrom.style.display = 'none';
        dropdownCitiesTo.style.display = 'block';
    } else {
        dropdownCitiesTo.style.display = 'none';
        dropdownCitiesFrom.style.display = 'none';
    }
}

const getDate = (date) => {
    return new Date(date).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const getNameCity = (code) => {
    const objCity = city.find(item => item.code === code);
    return objCity.name;
}

const getChanges = (num) => {

    if (num) {
        return num === 1 ? 'С одной пересадкой' : 'С двумя пересадками';
    } else {
        return 'Без пересадок';
    }
}

const noTicket = (deep, ticket) => {
    deep = 'К сожалению на текущую дату билетов не нашлось!';
    ticket.classList.add('alert_active');
    return deep;
} 

const createCard = (data) => {
    const ticket = d.createElement("article");
    ticket.classList.add('ticket');
    ticket.classList.toggle('alert_active', false);

    let deep = '';
    if (data){
        deep = `
            <h3 class="agent">${data.gate}</h3>
            <div class="ticket__wrapper">
                <div class="left-side">
                    <a href='${getLinkAviasales(data)}' target='_blank' class="button button__buy">Купить
                        за <br> ${Math.round(data.value * 0.36)} грн</a>
                </div>
                <div class="right-side">
                    <div class="block-left">
                        <div class="city__from">Вылет из города:<br>
                            <span class="city__name">${getNameCity(data.origin)}</span>
                        </div>
                        <div class="date">${getDate(data.depart_date)}</div>
                    </div>

                    <div class="block-right">
                        <div class="changes">${getChanges(data.number_of_changes)}</div>
                        <div class="city__to">Город назначения:<br>
                            <span class="city__name">${getNameCity(data.destination)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
       deep = noTicket(deep, ticket);
    }
    ticket.insertAdjacentHTML('afterbegin', deep);
    return ticket;
}

const renderCheapDay = (cheapTicket) => {
    cheapestTicket.style.display = 'block';
    cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';
    const ticket = createCard(cheapTicket[0]);
    cheapestTicket.append(ticket);
}

const renderCheapYear = (cheapTickets) => {
    otherCheapTickets.style.display = 'block';
    otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';
    cheapTickets.sort((a, b) => a.value - b.value);
    for (i = 0; i < cheapTickets.length && i < maxCount; i++){
        const ticket = createCard(cheapTickets[i]);
        otherCheapTickets.append(ticket);
    }
}

const renderCheap = (data, date) => {
    const cheapTicketYear = JSON.parse(data).best_prices;

    const cheapTicketDay = cheapTicketYear.filter((item) => {
        return item.depart_date === date;
    })
    
    renderCheapDay(cheapTicketDay);
    renderCheapYear(cheapTicketYear);
}

const showAlert = (from, to) => {
    if (!from) {
        alertFrom.style.display = 'block';
    }
    if (!to) {
        alertTo.style.display = 'block';
    }
}

const noFlight = () => {
    cheapestTicket.style.display = 'block';
    cheapestTicket.textContent = '';
    const showNoFlight = d.createElement('article');
    showNoFlight.textContent = 'No flight in this way, please choose another way!!!';
    showNoFlight.classList.add('no_flight');
    cheapestTicket.append(showNoFlight);
}

// events
inputCitiesFrom.addEventListener("input", () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesFrom.addEventListener("click", () => {
    chooseCity(inputCitiesFrom, dropdownCitiesFrom, event);
})

inputCitiesTo.addEventListener("input", () => {
    showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesTo.addEventListener("click", () => {
    chooseCity(inputCitiesTo, dropdownCitiesTo, event);
})

formSearch.addEventListener('submit', (event) => {
    event.preventDefault();
    alertFrom.style.display = 'none';
    alertTo.style.display = 'none';
    const formData = {
        from: city.find(item => inputCitiesFrom.value === item.name),
        to: city.find(item => inputCitiesTo.value === item.name),
        when: inputDateDepart.value
    }

    if (formData.from && formData.to) {
    const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}&one_way=true`;
    
    getData(proxy + calendarApi + requestData, (response) => {
        renderCheap(response, formData.when);
    },
    (error) => {
        noFlight();
        console.error('Error: ', error);
        
    })
    } else {
        showAlert(formData.from, formData.to);
    }
})

d.body.addEventListener('click', (event) => {
    hideDropwown(event);
})

//call Functions
getData(proxy + citiesApi, (data) => {
    city = JSON.parse(data).filter(item => item.name);

    city.sort((a, b) => {
        if(a.name > b.name){
            return 1;
        }
        else if (a.name < b.name){
            return -1;
        }
        return 0;
    })   
});

