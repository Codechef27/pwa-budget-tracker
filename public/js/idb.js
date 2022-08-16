
let db;

const request = indexedDB.open('budget_tracker', 1);


// emit the db version changes
request.onupgradeneeded = function(event) {
    const db = event.target.result;

    db.createObjectStore('new_budget_data', { autoIncrement: true } ); 
};

request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.online) {
        uploadBudgetData();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};


function saveData(data)  {
    const transaction = db.transaction(['new_budget_data'], 'readwrite');

    const dataObjectStore = transaction.objectStore('new_budget_data');

    dataObjectStore.add(data);
};

function uploadBudgetData()  {
    const transaction = db.transaction(['new_budget_data'], 'readwrite');

    const dataObjectStore = transaction.objectStore('new_budget_data');

    const getData = dataObjectStore.getAll();

    getData.onsuccess = () => {
        if(getData.result.length > 0){
            fetch('/api/transaction/bulk' ,{
                method: 'POST',
                body: JSON.stringify(getData.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json" 
                },
            })
            .then((res) => res.json())
            .then((serverRes) => {
                if(serverRes.message) {
                    throw new Error(serverRes);
                }
                const transaction = db.transaction(['new_budget_data'], 'readwrite');

                const dataObjectStore = transaction.objectStore('new_budget_data');

                dataObjectStore.clear();

                window.alert(" All new budget data was successfully entered in the budget tracker!")
            })
            .catch((err) => {
                console.log(err);
            })
        }
    }
}



window.addEventListener('online', uploadBudgetData);
