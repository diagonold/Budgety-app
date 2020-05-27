/**

Project planning and architecture
    Step 1: Plan plan

        Best to design and organize your app first before coding. Having a framework of how each module interacts will be really helpful
        
        create a todo list of the most essential part of your app, this will be our task will use also

        Create the data structure that you

        structuring our code with modules
            modules helps us encapsulate data
            modules helps us make our code more organized and separated
            modules will then interact each other
        
        Decide which task goes into which module
            put those task into modules where it make sense

        what is a module pattern?
            why modules?
                keep pieces of code together
                in this modules, some variables and methods will be private
                we will also have some public methods and public variables

                this is called data encapsulation
                in java we can do this, we can use IIFE and closure

            separation of concerns
                modules need not know all the data about other module
                
                how do we combine them?
                    just like the appController 
                    it connects both UIcontroller and budgetController 

    Step 2: Take a look at your current app and improve
        Add more functionality:
            Be able to delete items from income or expenses
                1. add event handler
                2. delete the item from data structure
                3. delete the item from the UI
                4. re-calculate the budget
                5. update the UI

    step 3: add more features
        1. calculate percentages of expenses 
        2. update the percentages in the UI
        3. Display the current month and year
        4. number formatiing
        5. improve input field UX


Bubbling
    when an child element triggers an event, the parent element will also know that the event happened

Event delegation
    when we attach an event handler into the parent element, so as to wait for an event that happens in the child element.

    use cases:
        when we have an element with lots if child element were interested in

        when we want an event handler attached to an  element that is not yet in the DOM when out page is loaded

DOM traversing
    on the target element, we can move up to the parent element

    call parentNode

     
 */ 

 // BUDGET CONTROLLER
 var budgetController = (function(){

    // There is gonna be a lot of expense and income thus we create an object to store data about them
    var Expense = function( id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function( totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.floor((this.value / totalIncome)* 100);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function( id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    // Choose carefully the kind of data structure for you
    // Lumping it in an object like this is recommended, it centralize everything
    var data = {
        allItems:{
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1  // Means an invalid value
    };

    var calculateTotal = function(type){
        var sum = 0;

        // loop over the array
        data.allItems[type].forEach(function(current, index, array){
            sum += current.value;
        });

        data.totals[type] = sum;
    };



    // this will return all our public methods
    return {
        addItem: function(type, des, val){

            var newItem,ID;
            
            // Create new ID
            // ID = last ID + 1
            if ( data.allItems[type].length > 0 ){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else {
                // For the very first ID 
                ID = 0;
            }


            // Create new item based on type
            if (type === "exp"){
                newItem = new Expense(ID, des, val);
            }
            else if ( type === "inc"){
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // return new element
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1){
                //splice is used to removed element
                // start removing at index
                // remove 1 argument from index onward
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            
            // calculate total income
            calculateTotal("inc");

            // calulate total expenses
            calculateTotal("exp");

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if( data.totals.inc > 0 ){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) ;
            }
            else{
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });

            return allPerc;
        },
 
        // get use to methods for setting and retrieving data
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },


        testing: function(){
            console.log(data);
        }

    }

 })();


 // UI CONTROLLER 
 var UIController = (function(){


    var formatNumber = function(num, type){
        var numSplit;


        num = Math.abs(num);
        // always fixed 2 decimal place
        // this is a number of the num prototype
        num = num.toFixed(2);
        numSplit = num.split('.');

        int = numSplit[0];

        if(int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,int.length); // input 2310 to 2,310
        }

        dec = numSplit[1];

        return (type === 'exp'? sign = '-': sign = '+') + ' ' + int + '.' + dec;

    
    };

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputAddBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:  '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };

    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {

        getInput: function(){
            return {
            type: document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function( obj, type){
            var HTML,newHTML, element;

            // Create HTML string with placeholder text
            if( type === "inc"){

                element = DOMstrings.incomeContainer;
                HTML = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if ( type === "exp"){

                element = DOMstrings.expensesContainer;

                HTML = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';;
            }

            // Replace the placeholder text with actual data
            newHTML = HTML.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value,type));

            // Insert the HTML into the DOM
            document.querySelector(element).
            insertAdjacentHTML('beforeend', newHTML);



        },

        clearFields: function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + "," + DOMstrings.inputValue);

            // Here is nice trick to turn a list into an array
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArr[0].focus();

        },

        displayBudget: function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

            if(obj.percentage > 0 ){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        deleteListItem: function( selectorID){
            // we can only delete child in HTML

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        displayPercentages: function(percentages){

            // if you do not know how many of that class is available, use querySelectorAll
            // querySelector only selects one
            // this returns a list
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


            // we need to iterate through this list, but list cannot be iterated through
            // we can turn the list into an array but this time we want to use another way of doing it.
            // This time we are using nodelistforEach
// using foreach method on an array 
            // the function will be applied to each element of the array
            // the anonymous function can accept up to 3 argument
            // The best way to go through a list
    
            nodeListForEach( fields, function(current, index){
                console.log(percentages[index]);

                if(percentages[index] >0 ){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }

            });
        },

        displayMonth: function(){
            var now, year, month;
            now = new Date();
            
            
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
            
        },

        changeType: function(){
            // remember that by having all, we select  multiple element
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ','+ DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
        

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
        },

        getDOMStrings: function(){
            return DOMstrings;
        }
    };

 })();


 // GLOBAL APP CONTROLLER
 var controller =  (function(budgetCtrl, UICtrl){
    // code to let budgetCtrl  and UICtrl communicate

    // helps us initialize all our event listeners
    var setupEventListeners = function(){


        // action the add button is pressed
        document.querySelector(DOM.inputAddBtn).addEventListener('click', function(){
       
            ctrlAddItem();
        });

        // action when the enter is pressed 
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        // Key part
        // we set the container as the parent element
        // This will allow us to set less event listeners 
        document.querySelector(DOM.container).addEventListener('click', ctrlDelItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

    }

    var DOM = UICtrl.getDOMStrings();

    var updateBudget = function(){
        var budget;

        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. return the budget
        var budget = budgetCtrl.getBudget();
        // 3. display the budget on the UI
        UICtrl.displayBudget(budget);

    }

    var updatePercentages = function(){
        
        // 1. calculate the percentages
        budgetCtrl.calculatePercentages();
        // 2. read the precentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
    

        // 3. update the UI of the percentages
        UICtrl.displayPercentages(percentages);
        
    }

    var ctrlAddItem =  function(){
        var input, newItem;

        // 1. Get the field input data
        input =  UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value );

            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the fields
            UICtrl.clearFields();

            // 5. calculate and update budget
            updateBudget();

            // 6. calculate and update percentages
            updatePercentages();        
        }

        
    };

    var ctrlDelItem = function(event){
        var itemID, splitID, type, ID;

        // Here we try DOM traversing
        // heavily reliant on the HTML structure due to harcoded
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // this allows us to do event delegation
        // only when the itemID is present then the event will be triggered
        if (itemID){

            // inc-integer
            // [0] = inc or exp
            // [1] = ID
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. update and show the new budget
            updateBudget();

            // 4. calculate and show the percentages
            UICtrl.displayBudget();

        }


    };

    return {
        init: function(){
            console.log("Application has started");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

 })(budgetController, UIController);
 

controller.init();