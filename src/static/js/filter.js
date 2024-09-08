const YAML_ATTRIBUTES = {
  "date": null,
  "time": null,
  "ego": null,
  "bag-name": null,
  "num-agents": null,
  "circuit-info": {
      "name": null,
      "abbr": null,
      "type": ["road course", "oval course", "hillclimb"]
  },
  "ambient-conditions": {
      "lighting": ["Mainly Sunny", "Cloudy", "Rainy"],
      "weather-temperature": null
  },
  "lap-info": {
      "lap-times": null,
      "total-distance": null,
      "total-laps": null,
      "total-moving-time": null,
      "total-run-time": null
  },
  "engine": {
      "max-rpm": null
  },
  "longitudinal-actuation": {
      "max-accelerator": null,
      "max-front-brake-pressure": null,
      "max-rear-brake-pressure": null
  },
  "longitudinal-speed": {
      "average": null,
      "top-actual": null,
      "top-target": null
  },
  "tires": {
      "max-FL-pressure": null,
      "max-FR-pressure": null,
      "max-RL-pressure": null,
      "max-RR-pressure": null,
      "max-mean-FL-temp": null,
      "max-mean-FR-temp": null,
      "max-mean-RL-temp": null,
      "max-mean-RR-temp": null
  }
};

let SET_VALUES = [];
let YAML_ATTRIBUTE = [];
let ALL_FILTERS = [];

const typecast = (x) => {
  if (x === "") return x;
  const num = Number(x);
  return Number.isNaN(num) ? x : num;
}

const addYamlAttribute = () => {
  const attributeSelect = document.getElementById('attribute');
  const allAttributes = document.getElementById('allattributes');
  const selectedAttribute = attributeSelect.value;

  // update the dropdown with sub-attributes
  if (YAML_ATTRIBUTES[selectedAttribute] && typeof YAML_ATTRIBUTES[selectedAttribute] === 'object') {
      const subAttributes = YAML_ATTRIBUTES[selectedAttribute];
      updateDropdownWithSubAttributes(subAttributes);
  } else {
      attributeSelect.disabled = true;
  }

  YAML_ATTRIBUTE.push(selectedAttribute);
  if (allAttributes.textContent === '') {
      allAttributes.textContent = `"${selectedAttribute}"`;
  } else {
      allAttributes.textContent = `${allAttributes.textContent} > "${selectedAttribute}"`;
  }

  // Check if the selected attribute is "lap-info > lap-times"
  if (YAML_ATTRIBUTE.join(' > ') === 'lap-info > lap-times') {
      document.getElementById('transformation-section').style.display = 'block';
  } else {
      document.getElementById('transformation-section').style.display = 'none';
  }

  attributeSelect.value = '';
};

const updateDropdownWithSubAttributes = (subAttributes) => {
  const attributeSelect = document.getElementById('attribute');
  attributeSelect.innerHTML = ''; // clear previous attribute options 

  for (let key in subAttributes) {
      if (subAttributes.hasOwnProperty(key)) {
          const option = document.createElement('option');
          option.value = key;
          option.textContent = key;
          attributeSelect.appendChild(option);
      }
  }
};

const addSetValue = () => {
  const setValue = document.getElementById('setvalue');
  const allSetValues = document.getElementById('setvalues');
  if (setValue.value) {
      SET_VALUES.push(setValue.value);
      if (allSetValues.textContent === '') {
          allSetValues.textContent = `"${setValue.value}"`;
      } else {
          allSetValues.textContent = `${allSetValues.textContent}, "${setValue.value}"`;
      }
  } else {
      SET_VALUES = [];
      allSetValues.textContent = "";
  }
  setValue.value = "";
  console.log(SET_VALUES);
}

const resetDropdown = () => {
  const attributeSelect = document.getElementById('attribute');
  attributeSelect.disabled = false; // reenable the dropdown
  attributeSelect.innerHTML = '';

  // repopulate with original YAML attributes
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select an attribute';
  attributeSelect.appendChild(defaultOption);

  for (let key in YAML_ATTRIBUTES) {
      if (YAML_ATTRIBUTES.hasOwnProperty(key)) {
          const option = document.createElement('option');
          option.value = key;
          option.textContent = key;
          attributeSelect.appendChild(option);
      }
  }

  // Hide the transformation section by default
  document.getElementById('transformation-section').style.display = 'none';
};

window.onload = () => {
  resetDropdown();

  document.getElementById('filtertype').addEventListener(
      'change', (e) => {
          const exact = document.getElementById('exact');
          const range = document.getElementById('range');
          const set = document.getElementById('set');
          exact.classList.add('hidden');
          range.classList.add('hidden');
          set.classList.add('hidden');
          if (e.target.value === 'exact') {
              exact.classList.remove('hidden');
          } else if (e.target.value === 'range') {
              range.classList.remove('hidden');
          } else if (e.target.value === 'set') {
              set.classList.remove('hidden');
          }
      }
  );

  document.getElementById('addfilterform').addEventListener(
      'submit', (e) => {
          e.preventDefault();
          const filtertype = document.getElementById('filtertype');
          const allattributes = document.getElementById('allattributes');
          const filterlist = document.getElementById('filterlist');
          const transformation = document.getElementById('transformation');

          resetDropdown();

          if (filtertype.value === 'exact') {
              const exactvalue = document.getElementById('exactvalue');
              if (exactvalue.value === '') {
                  alert("Please fill out all fields!");
              } else {
                  ALL_FILTERS.push({
                      attributes: YAML_ATTRIBUTE,
                      transformation: transformation.value,
                      type: "exact",
                      value: typecast(exactvalue.value),
                  });
                  let li = document.createElement('li');
                  const quotedAttributes = YAML_ATTRIBUTE.map(a => `"${a}"`);
                  li.textContent = `Require: attribute ${quotedAttributes.join('.')} = ${exactvalue.value} exactly`
                  filterlist.appendChild(li);
                  allattributes.textContent = "";
                  YAML_ATTRIBUTE = [];
              }
          } else if (filtertype.value === 'range') {
              const rangebegin = document.getElementById('rangebegin');
              const rangebegininclusive = document.getElementById('rangebegininclusive');
              const rangeend = document.getElementById('rangeend');
              const rangeendinclusive = document.getElementById('rangeendinclusive');
              ALL_FILTERS.push({
                  attributes: YAML_ATTRIBUTE,
                  transformation: transformation.value,
                  type: "range",
                  begin: typecast(rangebegin.value),
                  begin_inc: rangebegininclusive.checked,
                  end: typecast(rangeend.value),
                  end_inc: rangeendinclusive.checked,
              });
              const li = document.createElement('li');
              const quotedAttributes = YAML_ATTRIBUTE.map(a => `"${a}"`);
              const begin = rangebegin.value === "" ? "-∞" : rangebegin.value;
              const begin_bracket = rangebegininclusive.checked ? "[" : "(";
              const end = rangeend.value === "" ? "+∞" : rangeend.value;
              const end_bracket = rangeendinclusive.checked ? "]" : ")";
              li.textContent = `Require: attribute ${quotedAttributes.join('.')} is within ${begin_bracket}${begin}, ${end}${end_bracket}`
              filterlist.appendChild(li);
              allattributes.textContent = "";
              YAML_ATTRIBUTE = [];
          } else if (filtertype.value === 'set') {
              const setvalues = document.getElementById('setvalues');
              if (SET_VALUES == []) {
                  alert("Please fill out all fields!");
              } else {
                  ALL_FILTERS.push({
                      attributes: YAML_ATTRIBUTE,
                      transformation: transformation.value,
                      type: "set",
                      values: SET_VALUES.map(typecast),
                  });
                  let li = document.createElement('li');
                  const quotedAttributes = YAML_ATTRIBUTE.map(a => `"${a}"`);
                  const quotedSetValues = SET_VALUES.map(a => `"${a}"`);
                  li.textContent = `Require: attribute ${quotedAttributes.join('.')} is one of [${quotedSetValues.join()}]`;
                  filterlist.appendChild(li);
                  allattributes.textContent = "";
                  YAML_ATTRIBUTE = [];
                  setvalues.textContent = "";
                  SET_VALUES = [];
              }
          }
      }
  );

  document.getElementById('sendfilterform').addEventListener(
      'submit', (e) => {
          e.preventDefault();
          if (ALL_FILTERS.length === 0) {
              alert("Add a filter first!");
              return;
          }
          const filterlist = document.getElementById('filterlist');
          fetch('/filter', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  filters: ALL_FILTERS,
              }),
          })
              .then(async res => {
                  const response = await res.json();
                  localStorage.setItem('filteredRuns', JSON.stringify(response.runs)); // store the filtered runs in localStorage
                  window.location.href = 'runs'; // redirect to runs.html
                  // Clear the filter list and ALL_FILTERS
                  while (filterlist.firstChild) filterlist.removeChild(filterlist.firstChild);
                  ALL_FILTERS = [];
              })
      }
  )
}
