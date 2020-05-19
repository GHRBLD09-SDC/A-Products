import axios from 'axios';
const recordInteractions = (e) => {
  let widget = findName(e.target, 'data-widget');
  let element = findName(e.target, 'data-selector');
  let time = new Date();
  let interactions = {element, widget, time}
  // console.log('interactions: ', interactions)
  axios.post('http://52.26.193.201:3000/interactions', interactions)
  .then(() => {
    // console.log('success')
  })
}

const findName = (el, type)  => {
  // console.log('type', type)
  if (el.attributes[type]) {
    return el.attributes[type].value;
  }
  if (!!!el.parentNode) {
    return findName(el.parentNode, type);
  }
  if (type === 'data-widget') {
    return 'app';
  }
  if (type === 'data-selector') {
    return 'null';
  }
}

document.addEventListener('click', recordInteractions, false);

