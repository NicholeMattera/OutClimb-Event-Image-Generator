import ImageGenerator from './image-generator';

export default class FormManager {
    static get EventItemHTML () {
        return document.getElementById('event-item').innerHTML;
    }

    constructor () {
        this.imageGenerator = new ImageGenerator();

        // DOM Elements
        this.addEventButton = document.querySelector('#add-button');
        this.eventList = document.querySelector('#event-list');
        this.generateButton = document.querySelector('#generate-button');

        // Create initial event item
        const eventItem = document.createElement('li');
        eventItem.innerHTML = FormManager.EventItemHTML;
        eventItem.removeChild(eventItem.querySelector('.field:last-child'));
        this.eventList.appendChild(eventItem);

        // Automatically select the next month
        const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).getMonth();
        console.log(nextMonth);
        document.getElementsByName('month')[0].querySelector(`option:nth-of-type(${nextMonth + 1})`).selected = true;

        // Event Listeners
        this.addEventButton.addEventListener('click', this._onAddEventButtonClicked.bind(this));
        this.generateButton.addEventListener('click', this._onGenerateButtonClicked.bind(this));
    }

    _getData () {
        const events = [];
        const names = document.getElementsByName('name');
        const locations = document.getElementsByName('location');
        const details = document.getElementsByName('details');
        document.getElementsByName('day').forEach((day, index) => {
            events.push({
                day: day.value,
                name: names[index].value,
                details: details[index].value,
                location: locations[index].value
            });
        });

        events.sort((a, b) => parseInt(a.day) - parseInt(b.day));

        return {
            events,
            topDetails: document.getElementsByName('top-details')[0].value.trim(),
            bottomDetails: document.getElementsByName('bottom-details')[0].value.trim(),
            month: document.getElementsByName('month')[0].value,
        };
    }

    _onAddEventButtonClicked () {
        const eventItem = document.createElement('li');
        eventItem.innerHTML = FormManager.EventItemHTML;
        eventItem.querySelector('button').addEventListener('click', this._onRemoveEventButtonClicked.bind(this));
        this.eventList.appendChild(eventItem);
    }

    _onGenerateButtonClicked () {
        const data = this._getData();
        const imageURL = this.imageGenerator.generate(data);

        const anchor = document.createElement('a');
        anchor.download = `Outclimb-${data.month}-${Date.now()}.png`;
        anchor.href = imageURL;
        anchor.click();
    }

    _onRemoveEventButtonClicked (event) {
        const eventItem = event.target.parentElement.parentElement;
        eventItem.parentElement.removeChild(eventItem);
    }
}
