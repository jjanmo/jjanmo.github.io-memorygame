const modal = document.getElementById('js-modal');
const modalOverlay = document.getElementById('js-modal-overlay');
const modalContent = document.getElementById('js-modal-content')
const cardContentSel = document.getElementById('js-card-content');
const gameDifficultySel = document.getElementById('js-difficulty');
const message = document.getElementById('js-msg');
const startBtn = document.getElementById('js-start-button');
const timerDiv = document.getElementById('js-timer');
const cardBoard = document.getElementById('js-card-board');
let flipCount = 0;
let flippedCards = [];
// let start = false;
let timer, minute, second;
let cards, candidate, numberOfCards;

//card style관련 변수
let backgroundSize, cardContent, gameDifficuty;

//card object를 담는 배열
let cardObjInArray = [];
/*
card object
- id
- posId
- isFlipped 
*/

function showRecordModal(record) {
    modal.classList.remove('hidden');
    modalContent.textContent = `Your record is ${record}`
}

function exitModal() {
    modal.classList.add('hidden');
}

function getTimer() { //closure로 바꿔보기!!
    minute = 0;
    second = 0;
    // const startTime = timer.textContent;
    // console.log(startTime);
    timer = setInterval(function () {
        //data
        second++;
        if (second > 59) {
            minute++;
            second = 0;
        }
        //render
        let result = '';
        if (minute < 10) {
            if (second < 10) {
                result = `0${minute}:0${second}`;
            }
            else if (second < 60) {
                result = `0${minute}:${second}`;
            }
        }
        else if (minute < 60) {
            if (second < 10) {
                result = `${minute}:0${second}`;
            }
            else if (second < 60) {
                result = `${minute}:${second}`;
            }
        }
        document.getElementById('js-timer').textContent = result;
    }, 1000)
}


function readyGame() { //시작 전에 전체적으로 보여주는 단계
    cards.forEach((card, idx) =>
        setTimeout(() => {
            card.classList.add('isFlipped');
        }, 70 * idx)
    );
    cards.forEach((card) =>
        setTimeout(() => {
            card.classList.remove('isFlipped');
        }, numberOfCards / 4 * 400)
    );
}

function handleGameStart(e) {
    if (cardContent && gameDifficuty) {
        // console.log(cardContent, gameDifficuty);
        //타이머 초기화
        clearInterval(timer);
        minute = 0;
        second = 0;
        timerDiv.textContent = `00:00`;

        makeCardObject();
        paintBoard();
        readyGame();
        setTimeout(function () {
            cards.forEach(card => card.addEventListener('click', handleClickCard));
        }, 2000);
        setTimeout(function () {
            getTimer();
        }, numberOfCards / 4 * 300);
    }
    else {
        message.textContent = 'Please select card-content or diffuculty again';
        setTimeout(function () {
            message.textContent = '';
        }, 2000)
    }
}

function checkFlippedCards() {
    console.log(flippedCards);
    const firstCardObj = getCard(flippedCards[0]);
    const secondCardObj = getCard(flippedCards[1]);
    if (firstCardObj.posId === secondCardObj.posId) {
        flippedCards.forEach(cardId => {
            document.getElementById(`${cardId}`).removeEventListener('click', handleClickCard); //클릭 이벤트를 제거
        });
        //card obj state 변경
        firstCardObj.isFlipped = true;
        secondCardObj.isFlipped = true;
        if (checkGameEnd()) {
            clearInterval(timer);
            const record = timerDiv.textContent;
            showRecordModal(record);
        }
    }
    else {
        //다시 뒤집어 줘야함
        flippedCards.forEach(cardId => {
            setTimeout(() => {
                document.getElementById(`${cardId}`).classList.remove('isFlipped'); //다시 뒤집기
            }, 800);
        })
    }
}

function getCard(id) {
    return cardObjInArray.filter(cardObj => cardObj.id === id)[0];
}


function checkGameEnd() {
    return cardObjInArray.every(cardObj => cardObj.isFlipped);
}

function handleClickCard(e) {
    const { currentTarget } = e;
    console.log(currentTarget);
    if (flipCount < 2 && !currentTarget.className.includes('isFlipped')) {
        flipCount++;
        currentTarget.classList.toggle('isFlipped');
        flippedCards.push(currentTarget.id);
        if (flipCount === 2) {
            checkFlippedCards();
            setTimeout(() => {
                //안전장치 : 틀린 경우 다시 뒤집어질 때 뒤집어지는 액션이 완료되기전에 클릭할 수 없도록!
                flipCount = 0;
                flippedCards = [];
            }, 800)
        }
    }
}

function paintBoard() {
    const fragment = new DocumentFragment();
    cardBoard.innerHTML = '';   //board초기화
    cardObjInArray.forEach(cardObj => {
        const scene = document.createElement('div');
        scene.classList.add('scene');
        const card = document.createElement('div');
        card.classList.add('card');
        card.id = cardObj.id;
        scene.append(card);
        const front = document.createElement('div');
        front.classList.add('cardface', 'front');
        front.style.backgroundPosition = `${cardObj.posId}`;
        front.style.backgroundImage = `url("image/${cardContent}.png")`
        front.style.backgroundSize = `${backgroundSize}`;
        card.append(front);
        const back = document.createElement('div');
        back.classList.add('cardface', 'back');
        card.append(back);
        fragment.append(scene);
    });
    cardBoard.append(fragment);
    //카드보드 스타일 설정
    cardBoard.className = ''; //초기화 후 설정
    cardBoard.classList.add(`${gameDifficuty}`, 'card-board');

    cards = document.querySelectorAll('.card');
};

function makeCardDouble(cards) {
    const newCards = [];
    cards.forEach(card => {
        const newCard = Object.assign({}, card);
        newCards.push(card);
        newCards.push(newCard);
    });
    return newCards;
}

function suffleCards(notShuffledCards) {
    for (let i = 0; i < numberOfCards; i++) {
        cardObjInArray.push(notShuffledCards.splice(Math.floor(Math.random() * (numberOfCards - i)), 1)[0]);
        cardObjInArray[i].id = String(Date.now() * (i + 1)); //id부여
    }
    console.log(cardObjInArray);
}

function makeCardObject() {
    cardObjInArray = [];    //final card object 배열 초기화
    //필요한 카드 종류 뽑기
    const copiedCandidate = Array.from(candidate); //참조링크제거위해
    for (let i = 0; i < (candidate.length - numberOfCards / 2); i++) {
        copiedCandidate.splice(Math.floor(Math.random() * candidate.length - i), 1);
    }
    console.log(candidate, copiedCandidate);
    const doubledCandidate = makeCardDouble(copiedCandidate);            // 카드 2배로 만들기 
    console.log(doubledCandidate);

    suffleCards(doubledCandidate);                                      //카드섞기
}


function handleSelectContent(e) {
    const { target } = e;
    cardContent = target.value;
    candidate = []; //초기화
    //카드 종류  선택
    switch (cardContent) {
        case 'cute-animals': //19종류
            candidate = [
                { posId: '-33px -58px', isFlipped: false },
                { posId: '-131px -58px ', isFlipped: false },
                { posId: '-228px -58px ', isFlipped: false },
                { posId: '-324px -58px ', isFlipped: false },
                { posId: '-421px -58px', isFlipped: false },
                { posId: '-33px -155px ', isFlipped: false },
                { posId: '-133px -162px ', isFlipped: false },
                { posId: '-228px -160px ', isFlipped: false },
                { posId: '-324px -158px', isFlipped: false },
                { posId: '-33px -263px', isFlipped: false },
                { posId: '-133px -257px', isFlipped: false },
                { posId: '-229px -262px', isFlipped: false },
                { posId: '-325px -262px', isFlipped: false },
                { posId: '-422px -255px', isFlipped: false },
                { posId: '-33px -359px', isFlipped: false },
                { posId: '-132px -359px', isFlipped: false },
                { posId: '-229px -362px', isFlipped: false },
                { posId: '-324px -362px', isFlipped: false },
                { posId: '-420px -362px', isFlipped: false }
            ];
            //background-size 
            backgroundSize = '550%';
            break;
        case 'epl-logos': //20종류
            candidate = [
                { posId: '-58px -156px', isFlipped: false },
                { posId: '-161px -156px', isFlipped: false },
                { posId: '-256px -156px ', isFlipped: false },
                { posId: '-371px -156px ', isFlipped: false },
                { posId: '-475px -156px ', isFlipped: false },
                { posId: '-58px -265px ', isFlipped: false },
                { posId: '-163px -273px ', isFlipped: false },
                { posId: '-267px -271px ', isFlipped: false },
                { posId: '-371px -273px ', isFlipped: false },
                { posId: '-486px -274px ', isFlipped: false },
                { posId: '-58px -378px ', isFlipped: false },
                { posId: '-164px -384px ', isFlipped: false },
                { posId: '-272px -383px ', isFlipped: false },
                { posId: '-377px -384px ', isFlipped: false },
                { posId: '-494px -386px ', isFlipped: false },
                { posId: '-55px -497px ', isFlipped: false },
                { posId: '-164px -503px ', isFlipped: false },
                { posId: '-272px -497px ', isFlipped: false },
                { posId: '-370px -496px', isFlipped: false },
                { posId: '-493px -499px ', isFlipped: false },
            ];
            //background-size 
            backgroundSize = '650%';
            break;
        case 'smile-emoji': //15종류
            candidate = [
                { posId: '-10px -60px', isFlipped: false },
                { posId: '-120px -60px ', isFlipped: false },
                { posId: '-227px -60px ', isFlipped: false },
                { posId: '-335px -60px ', isFlipped: false },
                { posId: '-441px -60px ', isFlipped: false },
                { posId: '-10px -191px ', isFlipped: false },
                { posId: '-120px -191px ', isFlipped: false },
                { posId: '-227px -191px ', isFlipped: false },
                { posId: '-335px -191px ', isFlipped: false },
                { posId: '-440px -191px ', isFlipped: false },
                { posId: '-10px -365px ', isFlipped: false },
                { posId: '-120px -365px ', isFlipped: false },
                { posId: '-219px -365px ', isFlipped: false },
                { posId: '-335px -365px ', isFlipped: false },
                { posId: '-445px -365px ', isFlipped: false },
            ];
            //background-size 설정
            backgroundSize = '550%';
            break;
    }
}

function handleSelectDifficulty(e) {
    const { target } = e;
    gameDifficuty = target.value;
    switch (gameDifficuty) { //난이도에 따라 필요한 총 카드의 수
        case 'basic':
            numberOfCards = 16; //4*4
            break;
        case 'intermediate':
            numberOfCards = 20; //4*5
            break;
        case 'advanced':
            numberOfCards = 24; //4*6
            break;
    }
}

function init() {
    cardContentSel.addEventListener('change', handleSelectContent);
    gameDifficultySel.addEventListener('change', handleSelectDifficulty);
    startBtn.addEventListener('click', handleGameStart);
    //modal
    modalOverlay.addEventListener('click', exitModal);
}

init();