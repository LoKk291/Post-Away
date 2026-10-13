let currentSession = {
    lastFolder: null,
    donePosts: {}
};
let currentCompressionRun = null;
let currentPosts = [];
let currentCardsElements = [];
let isCompressingBackground = false;
let updateProfileUI = () => {};

const twitterTexts = [
    { en: "I hope it fills me up 🥛🥛", es: "¡Espero que esto me llene...! 🥛🥛" },
    { en: "What a great pair of... 🍒🍒", es: "¡Qué gran par de...! 🍒🍒" },
    { en: "Would my throat hold up...? 🥵🥵", es: "¿Dará mi garganta para esto...? 🥵🥵" },
    { en: "They look really juicy 😛😛", es: "¡Se ven muy jugosos! 😛😛" },
    { en: "I'm ready to take it all in 💦💦", es: "Estoy lista para recibirlo todo 💦💦" },
    { en: "Do you like the view from here? 👀🍑", es: "¿Te gusta la vista por acá? 👀🍑" },
    { en: "It’s bigger than I thought 😲🔥", es: "Es más grande de lo que pensaba 😲🔥" },
    { en: "I can't stop thinking about... 🤤💖", es: "No puedo dejar de pensar en... 🤤💖" },
    { en: "Is it for me...? 🎁🙈", es: "¿Es para mí...? 🎁🙈" },
    { en: "It's getting so hot... 🌡️💦", es: "Se está calentando todo... 🌡️💦" },
    { en: "I want to feel it inside 🖤🔥", es: "Quiero sentirlo adentro 🖤🔥" },
    { en: "So soft and yet so firm ☁️✨", es: "Tan suave y a la vez firme ☁️✨" },
    { en: "It tastes even better than it looks 🍭🍓", es: "Sabe aún mejor de lo que se ve 🍭🍓" },
    { en: "I'm feeling so naughty today 😈🍒", es: "Me siento muy traviesa hoy 😈🍒" },
    { en: "Can I have a taste...? 👅💦", es: "¿Puedo probar un poquito...? 👅💦" },
    { en: "The perfect size for me 📏👌", es: "El tamaño perfecto para mí 📏👌" },
    { en: "I'm dripping for you 💧🤤", es: "Estoy goteando por ti 💧🤤" },
    { en: "I want to be filled up 🥛💧", es: "Quiero que me rellenes 🥛💧" },
    { en: "Look at these babies 🍼🍼", es: "Mira a estos bebés 🍼🍼" },
    { en: "Ready for your presence 👑💦", es: "Lista para tu presencia 👑💦" },
    { en: "I think it belongs here 📥🔥", es: "Creo que esto pertenece aquí 📥🔥" },
    { en: "So much for me to handle? 👐💥", es: "¿Demasiado para que lo maneje? 👐💥" },
    { en: "I love how it feels... 💓✨", es: "Me encanta cómo se siente... 💓✨" },
    { en: "Don't stop now... 🚫🛑", es: "No pares ahora... 🚫🛑" },
    { en: "I want to be your favorite toy 🧸💕", es: "Quiero ser tu juguete favorito 🧸💕" },
    { en: "It’s so thick... 😮📏", es: "Está tan grueso... 😮📏" },
    { en: "Give it to me 🖐️🔥", es: "Dámelo ya 🖐️🔥" },
    { en: "I'm your little secret 🤫💖", es: "Soy tu pequeño secreto 🤫💖" },
    { en: "My mouth is watering 🤤👄", es: "Se me hace agua la boca 🤤👄" },
    { en: "Can you make it splash? 💦🌊", es: "¿Puedes hacerlo salpicar? 💦🌊" },
    { en: "I'm all yours 🎀🗝️", es: "Soy toda tuya 🎀🗝️" },
    { en: "Let's get messy 🧁🥛", es: "Hagamos un desastre 🧁🥛" },
    { en: "I can take more 📈🔥", es: "Puedo aguantar más 📈🔥" },
    { en: "Do you like my posture? 🧘‍♀️🍑", es: "¿Te gusta mi postura? 🧘‍♀️🍑" },
    { en: "I'm waiting for the cream 🥛✨", es: "Estoy esperando la cremita 🥛✨" },
    { en: "Is it too deep for me? 🌊😰", es: "¿Será muy profundo para mí? 🌊😰" },
    { en: "I want to be your meal 🍽️😋", es: "Quiero ser tu comida 🍽️😋" },
    { en: "It fits perfectly 🧩📦", es: "Encaja perfectamente 🧩📦" },
    { en: "I'm ready for the explosion 💣💥", es: "Lista para la explosión 💣💥" },
    { en: "Keep me satisfied 🏆💖", es: "Manténme satisfecha 🏆💖" },
    { en: "I love the pressure 💎💪", es: "Amo la presión 💎💪" },
    { en: "Make me moan 🎵❤️", es: "Hazme gemir 🎵❤️" },
    { en: "So shiny and smooth ✨🍯", es: "Tan briloso y suave ✨🍯" },
    { en: "I want every drop 💧🥛", es: "Quiero cada gota 💧🥛" },
    { en: "Don't be shy with it 🙈💥", es: "No seas tímido con eso 🙈💥" },
    { en: "I'm your designated space 📍🔥", es: "Soy tu espacio designado 📍🔥" },
    { en: "Are you ready to fill me? 📥🍼", es: "¿Listo para rellenarme? 📥🍼" },
    { en: "I can't wait to feel it 🕛💦", es: "No puedo esperar a sentirlo 🕛💦" },
    { en: "It's so heavy... 🏋️‍♀️💋", es: "Pesa tanto... 🏋️‍♀️💋" },
    { en: "Thinking about the taste 👅💭", es: "Pensando en el sabor 👅💭" },
    { en: "My favorite kind of workout 🏋️‍♀️🔥", es: "Mi tipo de entrenamiento favorito 🏋️‍♀️🔥" },
    { en: "Tracing every inch of you 🗺️🫦", es: "Recorriendo cada centímetro tuyo 🗺️🫦" },
    { en: "Needs a little bit of friction ⚡️🌡️", es: "Necesita un poco de fricción ⚡️🌡️" },
    { en: "Harder than the last time 📈💥", es: "Más duro que la última vez 📈💥" },
    { en: "I’ve been waiting for this craving 🍽️🤤", es: "He estado esperando este antojo 🍽️🤤" },
    { en: "Exploring the boundaries tonight 📍🌙", es: "Explorando los límites esta noche 📍🌙" },
    { en: "It’s begging to be unleashed 🔓🔥", es: "Está suplicando ser liberado 🔓🔥" },
    { en: "A dangerous kind of fun 🧨😈", es: "Un tipo de diversión peligrosa 🧨😈" },
    { en: "There's no turning back now ⏳🌪️", es: "Ya no hay vuelta atrás ⏳🌪️" },
    { en: "Slow and steady, or fast and wild? 🎢✨", es: "¿Lento y constante, o rápido y salvaje? 🎢✨" },
    { en: "Your rhythm is hypnotizing 🎼💓", es: "Tu ritmo me hipnotiza 🎼💓" },
    { en: "Still thinking about last night's session 💾🔥", es: "Aún pensando en la sesión de anoche 💾🔥" },
    { en: "Nothing compares to this intensity ⚡️👑", es: "Nada se compara a esta intensidad ⚡️👑" },
    { en: "Just you, me, and this heat 🌡️🕯️", es: "Solo tú, yo y este calor 🌡️🕯️" },
    { en: "The tension is palpable 🔗🧿", es: "La tensión se puede sentir 🔗🧿" },
    { en: "I have a few ideas for later... 💡😏", es: "Tengo un par de ideas para más tarde... 💡😏" },
    { en: "Craving your specific brand of trouble 📛👅", es: "Anhelando tu marca específica de problemas 📛👅" },
    { en: "It’s all about the buildup ⏳💦", es: "Todo se trata de la preparación ⏳💦" },
    { en: "Surrender to the moment 🏳️🖤", es: "Ríndete ante el momento 🏳️🖤" },
    { en: "You know exactly where to hit 🎯📍", es: "Sabes exactamente dónde dar 🎯📍" },
    { en: "Waking up with you on my mind ☀️🧠", es: "Despertando con la mente en ti ☀️🧠" },
    { en: "Too much is never enough ♾️🔥", es: "Demasiado nunca es suficiente ♾️🔥" },
    { en: "Can you handle the aftermath? 🌩️😈", es: "¿Puedes manejar las consecuencias? 🌩️😈" },
    { en: "My favorite view, hands down 🔭🍑", es: "Mi vista favorita, sin duda 🔭🍑" },
    { en: "Testing my limits today 📏⚠️", es: "Probando mis límites hoy 📏⚠️" },
    { en: "A little chaos is good for the soul 🌪️🍓", es: "Un poco de caos es bueno para el alma 🌪️🍓" },
    { en: "So demanding, but I love it 👑💕", es: "Tan exigente, pero me encanta 👑💕" },
    { en: "I'm losing control... 🌀📉", es: "Estoy perdiendo el control... 🌀📉" },
    { en: "That spot... yes, right there ☝️🫠", es: "Ese lugar... sí, justo ahí ☝️🫠" },
    { en: "Let’s skip to the good part ⏭️🔥", es: "Saltémonos a la parte buena ⏭️🔥" },
    { en: "Completely at your mercy tonight ⛓️🖤", es: "Completamente a tu merced esta noche ⛓️🖤" },
    { en: "That friction is driving me insane 💥🌡️", es: "Esa fricción me está volviendo loca 💥🌡️" },
    { en: "I can still feel your touch everywhere ✋✨", es: "Todavía puedo sentir tu tacto por todos lados ✋✨" },
    { en: "Let’s see how much we can handle ⚖️🔥", es: "Veamos cuánto podemos aguantar ⚖️🔥" },
    { en: "My body is craving that specific rhythm 🥁💦", es: "Mi cuerpo está pidiendo ese ritmo específico 🥁💦" },
    { en: "So tempting to just give in now 🤤🔗", es: "Es tan tentador simplemente ceder ahora 🤤🔗" },
    { en: "I’m counting down the minutes ⏳⌛", es: "Estoy contando los minutos ⏳⌛" },
    { en: "You have a way of breaking my focus 🧠🌩️", es: "Tienes una forma de romper mi concentración 🧠🌩️" },
    { en: "The anticipation is the best part 🎢😏", es: "La anticipación es la mejor parte 🎢😏" },
    { en: "I want to be your favorite distraction 🧸🎯", es: "Quiero ser tu distracción favorita 🧸🎯" },
    { en: "Such a beautiful mess we make 🌪️💖", es: "Qué desastre tan hermoso hacemos 🌪️💖" },
    { en: "Are you going to make me work for it? 😈👅", es: "¿Vas a hacer que me esfuerce por ello? 😈👅" },
    { en: "There's nowhere else I'd rather be 📍🗝️", es: "No hay otro lugar en el que prefiera estar 📍🗝️" },
    { en: "Unlocking new levels of pleasure 🔓💎", es: "Desbloqueando nuevos niveles de placer 🔓💎" },
    { en: "I can feel the heat radiating 🌡️🔥", es: "Puedo sentir cómo irradia el calor 🌡️🔥" },
    { en: "Your hands, your rules... for now ✋👑", es: "Tus manos, tus reglas... por ahora ✋👑" },
    { en: "Just thinking about it makes me shiver 🥶🤤", es: "Solo pensarlo me hace estremecer 🥶🤤" },
    { en: "I’m officially under your spell 🪄✨", es: "Oficialmente estoy bajo tu hechizo 🪄✨" },
    { en: "Ready to test the structural integrity? 🏗️💥", es: "¿Lista para probar la integridad estructural? 🏗️💥" },
    { en: "Don't stop, I'm right on the edge 📈🌊", es: "No pares, estoy justo en el borde 📈🌊" },
    { en: "It’s a dangerous game, but I love it 🎲🔥", es: "Es un juego peligroso, pero me encanta 🎲🔥" },
    { en: "Feeling bold and incredibly needy 🦁💖", es: "Sintiéndome audaz e increíblemente necesitada 🦁💖" },
    { en: "The perfect ending to a long day 🌙🍷", es: "El final perfecto para un largo día 🌙🍷" },
    { en: "I like how you own the room 👔🖤", es: "Me gusta cómo te adueñas de la habitación 👔🖤" },
    { en: "Everything else just fades away 🌫️✨", es: "Todo lo demás simplemente se desvanece 🌫️✨" },
    { en: "I want you to ravage me 🐺🔥", es: "Quiero que me devores 🐺🔥" },
    { en: "Fill my throat until I gag 💦🔞", es: "Llena mi garganta hasta que me ahogue 💦🔞" },
    { en: "Pin me down and show me who's boss ⛓️👊", es: "Ponme contra la pared y enséñame quién manda ⛓️👊" },
    { en: "I want your cum dripping down my chin 🥛🤤", es: "Quiero tu leche goteando por mi barbilla 🥛🤤" },
    { en: "F*ck me like you've been waiting all day 🍆💥", es: "Fóllame como si hubieras estado esperando todo el día 🍆💥" },
    { en: "I'm desperate to feel you deep inside 🥵🔥", es: "Estoy desesperada por sentirte bien profundo 🥵🔥" },
    { en: "My hole is tight and ready for your size 🍑📏", es: "Mi agujero está apretado y listo para tu tamaño 🍑📏" },
    { en: "Spit in my mouth and choke me 👅💦", es: "Escúpeme en la boca y ahógame 👅💦" },
    { en: "Use my body however you want 🧸⛓️", es: "Usa mi cuerpo como quieras 🧸⛓️" },
    { en: "I want you to ruin me tonight 🧨🔞", es: "Quiero que me arruines esta noche 🧨🔞" },
    { en: "Slide it in slow, then hit me hard 🍑⚡", es: "Deslízalo lento, y luego golpéame fuerte 🍑⚡" },
    { en: "I'm craving your taste on my tongue 👅🥛", es: "Anhelo tu sabor en mi lengua 👅🥛" },
    { en: "Pull my hair and make me scream your name 💇‍♀️🔊", es: "Jálame el pelo y haz que grite tu nombre 💇‍♀️🔊" },
    { en: "Treat me like a slut and finish inside 💦😈", es: "Trátame como una zorra y acábate adentro 💦😈" },
    { en: "I want to be sore tomorrow because of you 🍆🔥", es: "Quiero estar adolorida mañana por tu culpa 🍆🔥" },
    { en: "Take what's yours, don't ask for permission ✋🔞", es: "Toma lo que es tuyo, no pidas permiso ✋🔞" },
    { en: "My pussy is throbbing for your touch 🫦💓", es: "Mi coño palpita por tu tacto 🫦💓" },
    { en: "Break me in like a fresh piece of meat 🥩🔥", es: "Domame como a un pedazo de carne fresca 🥩🔥" },
    { en: "I want to choke on your c*ck 🍆👄", es: "Quiero ahogarme con tu polla 🍆👄" },
    { en: "Beg me to let you finish inside 🍼💦", es: "Suéplicame que te deje acabar adentro 🍼💦" },
    { en: "I want you to stretch me out until I can't walk 🍑🔥", es: "Quiero que me estires hasta que no pueda caminar 🍑🔥" },
    { en: "Beg for it, then take it by force 👿💥", es: "Suéplicame, y luego tómalo por la fuerza 👿💥" },
    { en: "I’m nothing but a toy for your pleasure tonight 🧸💦", es: "No soy más que un juguete para tu placer esta noche 🧸💦" },
    { en: "Deep, hard, and no mercy allowed 🍆🔞", es: "Profundo, duro y sin piedad 🍆🔞" },
    { en: "I want your mark on my skin everywhere 💋🐾", es: "Quiero tu marca en mi piel por todas partes 💋🐾" },
    { en: "Nothing feels better than your cock down my throat 👅💦", es: "Nada se siente mejor que tu polla en mi garganta 👅💦" },
    { en: "Forget about being gentle, I want it rough 🌪️🔥", es: "Olvídate de ser gentil, lo quiero rudo 🌪️🔥" },
    { en: "My walls are pulsating, waiting for you 🍑⚡", es: "Mis paredes palpitan, esperando por ti 🍑⚡" },
    { en: "I want to be so full I can barely breathe 🍼💨", es: "Quiero estar tan llena que apenas pueda respirar 🍼💨" },
    { en: "Face down, ass up, exactly how you like it 🍑☝️", es: "Cara abajo, culo arriba, exactamente como te gusta 🍑☝️" },
    { en: "I'm your property for the night, do whatever you want ⛓️🗝️", es: "Soy tu propiedad por la noche, haz lo que quieras ⛓️🗝️" },
    { en: "You don't deserve a soft landing, I want to be destroyed 🧨🔥", es: "No mereces un aterrizaje suave, quiero ser destruida 🧨🔥" },
    { en: "I want to taste your essence on my face 💦🥛", es: "Quiero saborear tu esencia en mi cara 💦🥛" },
    { en: "Don't hold back, I want to be sore for days 🍆🦵", es: "No te contengas, quiero estar adolorida por días 🍆🦵" },
    { en: "Every thrust is a reminder of who owns me 👑🔞", es: "Cada estocada es un recordatorio de quién me posee 👑🔞" },
    { en: "I'm begging you to use me like an animal 🐆🔥", es: "Te suplico que me uses como a un animal 🐆🔥" },
    { en: "Nothing but raw, unadulterated passion 🧪🔥", es: "Nada más que pasión cruda y sin adulterar 🧪🔥" },
    { en: "Make me choke, make me gag, make me yours 👄💦", es: "Hazme ahogar, hazme vomitar, hazme tuya 👄💦" },
    { en: "I’ll take everything you have to give and ask for more 📈🥛", es: "Tomaré todo lo que tengas para dar y pediré más 📈🥛" },
    { en: "Don't stop until I'm a screaming mess 🌪️💦", es: "No pares hasta que sea un desastre gritando 🌪️💦" },
    { en: "I want to be fucked until my legs shake 🦵🍑", es: "Quiero ser follada hasta que mis piernas tiemblen 🦵🍑" },
    { en: "Use me like a rag doll until I'm soaked 🧸💦", es: "Úsame como a una muñeca de trapo hasta que esté empapada 🧸💦" },
    { en: "I need your cock buried deep inside me 🍆⛰️", es: "Necesito tu polla enterrada profundo dentro de mí 🍆⛰️" },
    { en: "My holes are yours to fill completely 📥🌋", es: "Mis agujeros son tuyos para llenar completamente 📥🌋" },
    { en: "I want to feel you pounding inside me for hours ⏳🔨", es: "Quiero sentirte golpeándome por horas ⏳🔨" },
    { en: "Don't hold back, I can take all of you ⚖️🥛", es: "No te contengas, puedo tomarlo todo ⚖️🥛" },
    { en: "I want to be used until there's nothing left 🥀🚫", es: "Quiero ser usada hasta que no quede nada 🥀🚫" },
    { en: "Make me your personal slut tonight 💄💋", es: "Hazme tu zorra personal esta noche 💄💋" },
    { en: "I want to feel you stretch me to my limit 📏📐", es: "Quiero sentirte estirarme a mi límite 📏📐" },
    { en: "You can use every inch of my body 🗺️📍", es: "Puedes usar cada centímetro de mi cuerpo 🗺️📍" },
    { en: "I'm craving that deep, rough treatment 💥🤎", es: "Anhelo ese trato profundo y rudo 💥🤎" },
    { en: "I want you to breed me until I'm overflowing 🍼🌊", es: "Quiero que me preñes hasta que esté rebosante 🍼🌊" },
    { en: "Treat me like a piece of meat to be devoured 🥩👅", es: "Trátame como a un pedazo de carne para devorar 🥩👅" },
    { en: "I want to be your dirty little secret 🤫🔐", es: "Quiero ser tu pequeño secreto sucio 🤫🔐" },
    { en: "Don't stop until I'm begging for more 🛐🙏", es: "No pares hasta que suplique por más 🛐🙏" },
    { en: "I want to feel you pounding in every hole 💥🍑", es: "Quiero sentirte golpeando en cada agujero 💥🍑" },
    { en: "I love the way you look at me... 🌸✨", es: "Me encanta cómo me miras... 🌸✨" },
    { en: "Can I hold your hand a little longer? 🤝💕", es: "¿Puedo tomar tu mano un poco más? 🤝💕" },
    { en: "Everything is better when you're near ☁️💫", es: "Todo es mejor cuando estás cerca ☁️💫" },
    { en: "Just a gentle touch is enough to make me smile 🦋💖", es: "Solo un toque suave basta para hacerme sonreír 🦋💖" },
    { en: "I'm dreaming of our next moment together 🌙✨", es: "Soñando con nuestro próximo momento juntos 🌙✨" },
    { en: "There's something so sweet about you... 🍬🍯", es: "Hay algo tan dulce en ti... 🍬🍯" },
    { en: "Thinking of you makes my heart skip a beat 💓🌬️", es: "Pensar en ti hace que mi corazón dé un vuelco 💓🌬️" },
    { en: "I love our quiet little moments 🤫🕯️", es: "Me encantan nuestros pequeños momentos de silencio 🤫🕯️" },
    { en: "You have a way of making me feel so special 👑✨", es: "Tienes una forma de hacerme sentir tan especial 👑✨" },
    { en: "So soft, so warm, so perfect ☀️🧸", es: "Tan suave, tan cálido, tan perfecto ☀️🧸" },
    { en: "Wrapped in your arms is where I belong 🫂🏡", es: "Envuelta en tus brazos es donde pertenezco 🫂🏡" },
    { en: "Every whisper from you is a melody 🎵🌸", es: "Cada susurro tuyo es una melodía 🎵🌸" },
    { en: "I didn't know I could feel this way... ☁️🌈", es: "No sabía que podía sentirme así... ☁️🌈" },
    { en: "Let’s just stay like this for a while ⌛✨", es: "Quedémonos así un momento ⌛✨" },
    { en: "Your kindness is the best turn-on 🌷💖", es: "Tu amabilidad es lo que más me atrae 🌷💖" },
    { en: "I love how gentle you can be with me ☁️🤲", es: "Me encanta lo gentil que puedes ser conmigo ☁️🤲" },
    { en: "A soft kiss to start the day right 🌅💋", es: "Un beso suave para empezar bien el día 🌅💋" },
    { en: "You make my world feel so much lighter 🎈✨", es: "Haces que mi mundo se sienta mucho más ligero 🎈✨" },
    { en: "I’m so happy you’re mine 🎀🗝️", es: "Estoy tan feliz de que seas mío 🎀🗝️" },
    { en: "The perfect start to our story 📖✨", es: "El comienzo perfecto para nuestra historia 📖✨" }
];

function getRandomTwitterText() {
    const item = twitterTexts[Math.floor(Math.random() * twitterTexts.length)];
    return item ? (item.en || item) : '';
}





function updateGlobalRarStatus(elements) {
    const rarStatus = document.getElementById('rar-status');
    if (!rarStatus) return;
    let completed = 0;
    for (const item of elements) {
        if (item.btnCompress.textContent.includes("Comprimido")) {
            completed++;
            if (item.btnAutofill) {
                item.btnAutofill.disabled = false;
                item.btnAutofill.style.opacity = '1';
                item.btnAutofill.title = "Autorellenar en Patreon Web";
            }
        } else {
            if (item.btnAutofill) {
                item.btnAutofill.disabled = true;
                item.btnAutofill.style.opacity = '0.5';
                item.btnAutofill.title = "Deshabilitado hasta que el .rar termine";
            }
        }
    }

    if (completed >= elements.length && elements.length > 0) {
        rarStatus.style.background = 'var(--panel-bg)';
        rarStatus.style.color = 'var(--success-color)';
        rarStatus.style.borderColor = 'var(--success-color)';
        rarStatus.innerHTML = `✅ ¡Todos los .rar están listos! (${completed}/${elements.length})`;

        const btnCompressAll = document.getElementById('btn-compress-all');
        if (btnCompressAll) btnCompressAll.style.display = 'none';
    } else if (elements.length > 0) {
        rarStatus.style.background = 'var(--panel-bg)';
        rarStatus.style.color = 'var(--text-muted)';
        rarStatus.style.borderColor = 'var(--border-color)';
        if (isCompressingBackground) {
            rarStatus.innerHTML = `⏳ Generando archivos .rar en segundo plano... (<span id="rar-count">${completed}</span>/<span id="rar-total">${elements.length}</span>)`;
        } else {
            rarStatus.innerHTML = `⏳ Archivos preparados para comprimir: (<span id="rar-count">${completed}</span>/<span id="rar-total">${elements.length}</span>)`;
        }
    } else {
        rarStatus.innerHTML = "";
        rarStatus.style.background = "transparent";
        rarStatus.style.border = "none";
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    currentSession = await window.electronAPI.getSession() || { lastFolder: null, donePosts: {} };
    if (!currentSession.donePosts) currentSession.donePosts = {};
    if (!currentSession.patreonUrls) currentSession.patreonUrls = { nova: '', nicky: '' };
    if (!currentSession.qcDone) currentSession.qcDone = {};
    if (!currentSession.specialRequests) currentSession.specialRequests = {};
    if (!currentSession.viewMode) currentSession.viewMode = 'grid';

    // Mobile Server IP and QR
    try {
        const btnShowQr = document.getElementById('btn-show-qr');
        const qrModal = document.getElementById('qr-modal');
        const qrImage = document.getElementById('qr-image');
        const mobileIpInput = document.getElementById('mobile-ip-input');
        const btnCloseQrModal = document.getElementById('btn-close-qr-modal');
        
        // Carga inicial
        window.electronAPI.getLocalIp().then(localIp => {
            if (mobileIpInput) {
                mobileIpInput.value = `http://${localIp}:3031`;
            }
        });

        if (btnShowQr && qrModal && qrImage) {
            btnShowQr.addEventListener('click', async () => {
                btnShowQr.disabled = true;
                qrModal.style.display = 'flex'; // Show modal
                qrImage.src = ''; // Clear old image while loading
                
                try {
                    const localIp = await window.electronAPI.getLocalIp();
                    const hostname = await window.electronAPI.getHostname();
                    
                    const mobileUrl = `http://${localIp}:3031`;
                    if (mobileIpInput) mobileIpInput.value = mobileUrl;
                    
                    const hostnameUrlEl = document.getElementById('hostname-url');
                    if (hostnameUrlEl) hostnameUrlEl.textContent = `http://${hostname}:3031`;
                    
                    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mobileUrl)}`;
                } catch(e) {
                    console.error(e);
                }
                btnShowQr.disabled = false;
            });
            
            btnCloseQrModal.addEventListener('click', () => {
                qrModal.style.display = 'none';
            });
            
            // Cerrar modal al hacer click fuera del contenido
            qrModal.addEventListener('click', (e) => {
                if (e.target === qrModal) {
                    qrModal.style.display = 'none';
                }
            });
        }
    } catch(e) {
        console.error("Error setting up mobile IP", e);
    }
    
    // Configurar texto del botón de vista si existe
    const btnToggleView = document.getElementById('btn-toggle-view');
    if (btnToggleView) {
        btnToggleView.innerHTML = currentSession.viewMode === 'list' ? '🗂️ Vista: Lista' : '🗂️ Vista: Cajas';
        
        btnToggleView.addEventListener('click', async () => {
            currentSession.viewMode = currentSession.viewMode === 'list' ? 'grid' : 'list';
            btnToggleView.innerHTML = currentSession.viewMode === 'list' ? '🗂️ Vista: Lista' : '🗂️ Vista: Cajas';
            await window.electronAPI.saveSession(currentSession);
            
            if (gestorState.selectedMonth && gestorState.selectedDate) {
                renderGestorDateContentsList();
            }
            if (gestorState.outputCharacters) {
                renderGestorCharactersList();
            }
        });
    }

    // Lock Screen Logic
    const lockScreen = document.getElementById('lock-screen');
    const mainApp = document.getElementById('main-app');
    const pinInput = document.getElementById('pin-input');
    const btnUnlock = document.getElementById('btn-unlock');
    const pinError = document.getElementById('pin-error');

    const checkPin = () => {
        if (pinInput.value === '19693101') {
            lockScreen.style.opacity = '0';
            setTimeout(() => {
                lockScreen.style.display = 'none';
                mainApp.style.display = 'block';
            }, 300);
        } else {
            pinError.style.display = 'block';
            pinInput.value = '';
            pinInput.focus();
            setTimeout(() => pinError.style.display = 'none', 3000);
        }
    };

    btnUnlock.addEventListener('click', checkPin);
    pinInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPin();
    });

    // Setup generic configs
    const globalDate = document.getElementById('global-date');
    const globalTime = document.getElementById('global-time');
    const profileNova = document.getElementById('profile-nova');
    const profileNicky = document.getElementById('profile-nicky');
    const profileNovaLabel = document.getElementById('profile-nova-label');
    const profileNickyLabel = document.getElementById('profile-nicky-label');

    if (currentSession.globalDate) globalDate.value = currentSession.globalDate;
    if (currentSession.globalTime) globalTime.value = currentSession.globalTime;

    updateProfileUI = () => {
        const isNova = currentSession.activeProfile === 'nova';
        profileNova.checked = isNova;
        profileNicky.checked = !isNova;
        profileNovaLabel.style.background = isNova ? 'var(--primary-color)' : 'var(--bg-color)';
        profileNovaLabel.style.borderColor = isNova ? 'var(--primary-color)' : 'var(--border-color)';
        profileNovaLabel.style.color = isNova ? '#E2E8F0' : 'var(--text-color)';
        profileNickyLabel.style.background = !isNova ? 'var(--primary-color)' : 'var(--bg-color)';
        profileNickyLabel.style.borderColor = !isNova ? 'var(--primary-color)' : 'var(--border-color)';
        profileNickyLabel.style.color = !isNova ? '#E2E8F0' : 'var(--text-color)';
        
        const patreonUrl = document.getElementById('patreon-url');
        if (patreonUrl) {
            patreonUrl.value = currentSession.patreonUrls[currentSession.activeProfile] || '';
        }
    };
    if (!currentSession.activeProfile) currentSession.activeProfile = 'nicky';
    updateProfileUI();

    const patreonUrl = document.getElementById('patreon-url');
    if (patreonUrl) {
        patreonUrl.addEventListener('input', async () => {
            currentSession.patreonUrls[currentSession.activeProfile] = patreonUrl.value;
            await saveSession();
        });
    }

    profileNova.addEventListener('change', async () => {
        currentSession.activeProfile = 'nova';
        updateProfileUI();
        await saveSession();
        if (currentPosts.length > 0) renderTwitterGrid(currentPosts);
    });
    profileNicky.addEventListener('change', async () => {
        currentSession.activeProfile = 'nicky';
        updateProfileUI();
        await saveSession();
        if (currentPosts.length > 0) renderTwitterGrid(currentPosts);
    });

    const saveSettings = async () => {
        currentSession.globalDate = globalDate.value;
        currentSession.globalTime = globalTime.value;
        await saveSession();
    };

    globalDate.addEventListener('change', saveSettings);
    globalTime.addEventListener('change', saveSettings);

    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabContents.forEach(content => {
                if (content.id === `dashboard-${target}`) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });

            const globalSettings = document.getElementById('global-settings');
            if (globalSettings) {
                if (target === 'gestor') {
                    globalSettings.style.display = 'none';
                } else {
                    globalSettings.style.display = '';
                }
            }

            const batchContainer = document.getElementById('batch-upload-container');
            const btnCompressAll = document.getElementById('btn-compress-all');
            const rarStatus = document.getElementById('rar-status');
            if (target === 'twitter' || target === 'gestor') {
                if (batchContainer) batchContainer.style.display = 'none';
                if (btnCompressAll) btnCompressAll.style.display = 'none';
                if (rarStatus) rarStatus.style.display = 'none';
            } else if (target === 'patreon') {
                if (currentPosts && currentPosts.length > 0) {
                    if (batchContainer) batchContainer.style.display = 'flex';
                    if (btnCompressAll) btnCompressAll.style.display = 'block';
                }
                if (rarStatus) rarStatus.style.display = '';
            }

            if (target === 'twitter') {
                autoFetchPatreonLinks(true);
            }
        });
    });



    document.getElementById('btn-toggle-all').addEventListener('click', () => {
        const checkboxes = Array.from(document.querySelectorAll('.done-checkbox'));
        if (checkboxes.length === 0) return;
        const checkedCount = checkboxes.filter(cb => cb.checked).length;
        const targetState = checkedCount < checkboxes.length / 2;
        checkboxes.forEach(cb => {
            if (cb.checked !== targetState) cb.click();
        });
    });

    document.getElementById('btn-compress-all').addEventListener('click', () => {
        if (!currentCardsElements || currentCardsElements.length === 0) return;

        isCompressingBackground = true;
        document.getElementById('btn-compress-all').disabled = true;
        document.getElementById('btn-compress-all').textContent = "📦 Comprimiendo archivos en segundo plano...";
        document.getElementById('btn-compress-all').style.cursor = "not-allowed";
        document.getElementById('btn-compress-all').style.opacity = "0.7";

        const thisRun = Symbol();
        currentCompressionRun = thisRun;

        updateGlobalRarStatus(currentCardsElements);
        startBackgroundCompression(currentCardsElements, thisRun);
    });

    // Checkbox Modo Super Automático (Patreon)
    const chkSuperAuto = document.getElementById('chk-super-auto');
    if (chkSuperAuto) {
        if (currentSession.superAutoMode !== undefined) {
            chkSuperAuto.checked = !!currentSession.superAutoMode;
        }
        chkSuperAuto.addEventListener('change', async () => {
            currentSession.superAutoMode = chkSuperAuto.checked;
            await saveSession();
        });
    }

    if (currentSession.lastFolder) {
        await loadFolderData(currentSession.lastFolder);
    }


    const btnSelect = document.getElementById('btn-select');
    btnSelect.addEventListener('click', async () => {
        const folder = await window.electronAPI.selectFolder();
        if (folder) {
            await navigateToFolder(folder);
        }
    });

    const btnPrevFolder = document.getElementById('btn-prev-folder');
    const btnNextFolder = document.getElementById('btn-next-folder');
    const folderDropdown = document.getElementById('folder-dropdown');

    btnPrevFolder.addEventListener('click', async () => {
        if (folderDropdown.selectedIndex > 0) {
            const newPath = folderDropdown.options[folderDropdown.selectedIndex - 1].value;
            await navigateToFolder(newPath);
        }
    });

    btnNextFolder.addEventListener('click', async () => {
        if (folderDropdown.selectedIndex < folderDropdown.options.length - 1 && folderDropdown.selectedIndex >= 0) {
            const newPath = folderDropdown.options[folderDropdown.selectedIndex + 1].value;
            await navigateToFolder(newPath);
        }
    });

    folderDropdown.addEventListener('change', async () => {
        const newPath = folderDropdown.value;
        await navigateToFolder(newPath);
    });

    const btnOpenExplorer = document.getElementById('btn-open-explorer');
    btnOpenExplorer.addEventListener('click', async () => {
        if (currentSession.lastFolder) {
            await window.electronAPI.openFolder(currentSession.lastFolder);
        }
    });

    let isFetchingPatreon = false;
    let patreonFetchPromise = null;

    async function autoFetchPatreonLinks(silent = false) {
        if (isFetchingPatreon && patreonFetchPromise) {
            return patreonFetchPromise;
        }
        if (!currentPosts || currentPosts.length === 0) return;

        const currentUrl = currentSession.patreonUrls?.[currentSession.activeProfile];
        if (!currentUrl) {
            if (!silent) alert("Por favor ingresa tu Link de Patreon en Configuraciones Generales para este perfil.");
            return;
        }

        // Si ya todos los posts tienen link en su textarea, no buscar nuevamente
        const allHaveLinks = currentPosts.every(post => {
            const inputEl = document.getElementById(`patreon-link-${post.id}`);
            return inputEl && inputEl.value.trim().length > 0;
        });
        if (allHaveLinks) return;

        isFetchingPatreon = true;
        const btnFetch = document.getElementById('btn-fetch-patreon');
        if (btnFetch) {
            btnFetch.textContent = "🔗 Obteniendo links automáticamente...";
            btnFetch.disabled = true;
        }

        patreonFetchPromise = (async () => {
            try {
                const result = await window.electronAPI.fetchPatreonLinks(currentUrl, currentPosts);
                if (result && result.success && result.links) {
                    let foundCount = 0;
                    for (const post of currentPosts) {
                        if (result.links[post.folderName]) {
                            foundCount++;
                            const inputId = `patreon-link-${post.id}`;
                            const inputEl = document.getElementById(inputId);
                            if (inputEl) {
                                inputEl.value = result.links[post.folderName];
                                inputEl.dispatchEvent(new Event('input'));
                            }
                        }
                    }
                    if (btnFetch) {
                        btnFetch.textContent = foundCount > 0 ? "✅ Links Obtenidos" : "⚠️ Sin nuevos links";
                        setTimeout(() => {
                            btnFetch.textContent = "🔗 Obtener Links de Patreon";
                            btnFetch.disabled = false;
                        }, 3000);
                    }
                } else {
                    if (!silent && result?.error) alert("Error obteniendo links de Patreon: " + result.error);
                    if (btnFetch) {
                        btnFetch.textContent = "🔗 Obtener Links de Patreon";
                        btnFetch.disabled = false;
                    }
                }
            } catch (err) {
                console.error("Error al obtener links de Patreon:", err);
                if (btnFetch) {
                    btnFetch.textContent = "🔗 Obtener Links de Patreon";
                    btnFetch.disabled = false;
                }
            } finally {
                isFetchingPatreon = false;
                patreonFetchPromise = null;
            }
        })();

        return patreonFetchPromise;
    }

    const btnFetchPatreon = document.getElementById('btn-fetch-patreon');
    if (btnFetchPatreon) {
        btnFetchPatreon.addEventListener('click', async () => {
            await autoFetchPatreonLinks(false);
        });
    }

    const btnAutoBatchX = document.getElementById('btn-auto-batch-x');
    if (btnAutoBatchX) {
        btnAutoBatchX.addEventListener('click', async () => {
            const cards = document.querySelectorAll('#twitter-grid .post-card');
            if (cards.length === 0 || !currentPosts || currentPosts.length === 0) {
                alert("No hay posts cargados en el feed de X. Por favor selecciona o arrastra una carpeta primero.");
                return;
            }

            // Sincronizar inmediatamente el feed con Electron
            await syncTwitterFeedToMain(true);

            const confirmBatch = confirm(`¿Iniciar la subida automática en cadena de ${currentPosts.length} posts a X?\n\nSe abrirá el navegador y cada post se preparará automáticamente en una pestaña separada de X (subiendo texto, imágenes y configurando fecha/hora), dejándolas listas para tu verificación final.`);
            if (!confirmBatch) return;

            btnAutoBatchX.disabled = true;
            btnAutoBatchX.textContent = "⚡ Iniciando Cadena en X...";

            try {
                const targetUrl = 'https://x.com/compose/post#postaway_idx=0&postaway_autorun=1';
                await window.electronAPI.openTwitter(currentSession.activeProfile, targetUrl);
            } catch (err) {
                console.error("Error al iniciar subida automática a X:", err);
                alert("Error al abrir X: " + err.message);
            } finally {
                setTimeout(() => {
                    btnAutoBatchX.disabled = false;
                    btnAutoBatchX.textContent = "⚡ Subida Automática a X (En Cadena)";
                }, 4000);
            }
        });
    }

    document.getElementById('btn-clear').addEventListener('click', async () => {
        await clearCurrentSession(false);
    });

    // Drag & Drop Folder functionality for Patreon and Twitter dashboards
    const dashPatreon = document.getElementById('dashboard-patreon');
    const dashTwitter = document.getElementById('dashboard-twitter');
    const dropTargets = [dashPatreon, dashTwitter].filter(Boolean);

    dropTargets.forEach(target => {
        let dragCounter = 0;

        target.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter++;
            if (dragCounter === 1) {
                target.classList.add('drag-over-active');
            }
        });

        target.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'copy';
            }
        });

        target.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter--;
            if (dragCounter <= 0) {
                dragCounter = 0;
                target.classList.remove('drag-over-active');
            }
        });

        target.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter = 0;
            target.classList.remove('drag-over-active');

            const files = e.dataTransfer.files;
            if (!files || files.length === 0) return;

            const droppedPath = files[0].path;
            if (!droppedPath) return;

            const isDir = await window.electronAPI.checkIsDirectory(droppedPath);
            if (!isDir) {
                alert('⚠️ Por favor, arrastra una carpeta válida desde el explorador de archivos.');
                return;
            }

            // Limpiar sesión anterior si había una carpeta abierta, como si se clickeara limpiar sesión
            if (currentSession.lastFolder || (currentPosts && currentPosts.length > 0) || Object.keys(currentSession.donePosts || {}).length > 0) {
                await clearCurrentSession(true);
            }

            await navigateToFolder(droppedPath);
        });
    });
});

async function clearCurrentSession(skipConfirm = false) {
    if (!skipConfirm) {
        if (!confirm('¿Estás seguro de que quieres limpiar toda la grilla de posts? Esto removerá la carpeta actual y reiniciará tu panel.')) return false;
    }

    if (currentPosts && currentPosts.length > 0) {
        const folderPaths = currentPosts.map(p => p.path);
        await window.electronAPI.deleteRars(folderPaths);
    }

    currentSession.lastFolder = null;
    currentSession.donePosts = {};
    currentSession.twitterSchedule = {};
    await saveSession();

    currentPosts = [];
    currentCardsElements = [];
    isCompressingBackground = false;
    currentCompressionRun = null;

    const btnClear = document.getElementById('btn-clear');
    if (btnClear) btnClear.style.display = 'none';
    const btnCompressAll = document.getElementById('btn-compress-all');
    const batchContainer = document.getElementById('batch-upload-container');
    if (btnCompressAll) btnCompressAll.style.display = 'none';
    if (batchContainer) batchContainer.style.display = 'none';
    const globalSettings = document.getElementById('global-settings');
    if (globalSettings) globalSettings.classList.add('hidden');
    const pathIndicator = document.getElementById('path-indicator');
    if (pathIndicator) pathIndicator.classList.add('hidden');
    document.querySelectorAll('.grid-actions').forEach(el => el.style.display = 'none');
    
    const postsGrid = document.getElementById('posts-grid');
    if (postsGrid) {
        postsGrid.innerHTML = `
            <div class="empty-state">
                Selecciona una carpeta para comenzar a organizar tus posts.
            </div>
        `;
    }
    const twitterGrid = document.getElementById('twitter-grid');
    if (twitterGrid) {
        twitterGrid.innerHTML = `
            <div class="empty-state">
                No hay carpetas seleccionadas.
            </div>
        `;
    }
    return true;
}

async function navigateToFolder(newPath, keepCurrentRars = false) {
    if (!newPath) return;
    if (!keepCurrentRars && currentPosts && currentPosts.length > 0) {
        const folderPaths = currentPosts.map(p => p.path);
        await window.electronAPI.deleteRars(folderPaths);
    }
    currentSession.lastFolder = newPath;
    await saveSession();
    await loadFolderData(newPath);
}

async function saveSession() {
    await window.electronAPI.saveSession(currentSession);
}

async function loadFolderData(folderPath) {
    const pathIndicator = document.getElementById('path-indicator');
    const postsGrid = document.getElementById('posts-grid');
    const dropdown = document.getElementById('folder-dropdown');

    pathIndicator.classList.remove('hidden');
    document.getElementById('app-tabs').classList.remove('hidden');
    document.getElementById('global-settings').classList.remove('hidden');
    document.getElementById('btn-clear').style.display = 'block';
    document.querySelectorAll('.grid-actions').forEach(el => el.style.display = 'flex');
    
    try {
        const siblingFolders = await window.electronAPI.getSiblingFolders(folderPath);
        if (dropdown) {
            dropdown.innerHTML = '';
            siblingFolders.forEach((folder) => {
                const option = document.createElement('option');
                option.value = folder.path;
                option.textContent = folder.name;
                if (folder.path === folderPath) {
                    option.selected = true;
                }
                dropdown.appendChild(option);
            });
        }
    } catch (e) {
        console.error('Error fetching sibling folders:', e);
    }

    const isAgregados = folderPath.toLowerCase().endsWith('_agregados');
    const agregadosBanner = document.getElementById('agregados-banner');
    const agregadosBannerText = document.getElementById('agregados-banner-text');
    const agregadosBannerIcon = document.getElementById('agregados-banner-icon');
    const agregadosBannerActions = document.getElementById('agregados-banner-actions');
    const headerElement = document.querySelector('.glass-header');

    if (agregadosBanner) {
        agregadosBanner.className = 'hidden';
        agregadosBanner.style.display = 'none';
        headerElement.style.borderBottom = '';
        agregadosBannerActions.innerHTML = '';

        if (isAgregados) {
            agregadosBanner.className = '';
            agregadosBanner.style.display = 'flex';
            agregadosBanner.style.background = 'var(--panel-bg)';
            agregadosBanner.style.color = 'var(--primary-color)';
            agregadosBanner.style.border = '1px solid var(--border-color)';
            agregadosBannerIcon.innerHTML = '🟣';
            agregadosBannerText.textContent = 'Estás en MODO AGREGADOS. Gestiona los nuevos personajes y fusiónalos al terminar.';
            
            headerElement.style.borderBottom = '1px solid var(--border-color)';

            const btnBack = document.createElement('button');
            btnBack.className = 'btn secondary-btn';
            btnBack.style.cssText = '';
            btnBack.textContent = '🔙 Volver a la original';
            btnBack.onclick = () => navigateToFolder(folderPath.replace(/_agregados$/i, ''));

            const btnMerge = document.createElement('button');
            btnMerge.className = 'btn primary-btn';
            btnMerge.style.cssText = '';
            btnMerge.textContent = '🔄 Fusionar con Original';
            btnMerge.onclick = async () => {
                if (confirm(`¿Estás seguro de que deseas fusionar y mover estos agregados a la carpeta original y ELIMINAR esta carpeta de agregados?`)) {
                    btnMerge.textContent = 'Fusionando...';
                    btnMerge.disabled = true;
                    const result = await window.electronAPI.mergeFolder(folderPath);
                    if (result.success) {
                        alert('¡Fusión completada con éxito!');
                        await navigateToFolder(result.targetPath);
                    } else {
                        alert('Error al fusionar: ' + result.error);
                        btnMerge.textContent = '🔄 Fusionar con Original';
                        btnMerge.disabled = false;
                    }
                }
            };

            agregadosBannerActions.appendChild(btnBack);
            agregadosBannerActions.appendChild(btnMerge);

        } else {
            const targetAgregadosPath = folderPath + '_agregados';
            const hasAgregados = await window.electronAPI.checkFolderExists(targetAgregadosPath);
            if (hasAgregados) {
                agregadosBanner.className = '';
                agregadosBanner.style.display = 'flex';
                agregadosBanner.style.background = 'var(--panel-bg)';
                agregadosBanner.style.color = 'var(--text-muted)';
                agregadosBanner.style.border = '1px solid var(--border-color)';
                agregadosBannerIcon.innerHTML = '⚠️';
                agregadosBannerText.textContent = 'Tienes personajes agregados pendientes de fusionar en una carpeta separada.';
                
                const btnGo = document.createElement('button');
                btnGo.className = 'btn secondary-btn';
                btnGo.style.cssText = '';
                btnGo.textContent = 'Ir a Agregados ➡️';
                btnGo.onclick = () => navigateToFolder(targetAgregadosPath);
                agregadosBannerActions.appendChild(btnGo);
            }
        }
    }

    postsGrid.innerHTML = '<div class="empty-state">Escaneando carpeta...</div>';
    document.getElementById('twitter-grid').innerHTML = '<div class="empty-state">Cargando feed de X...</div>';

    const posts = await window.electronAPI.readFolder(folderPath);

    if (posts.length === 0) {
        postsGrid.innerHTML = '<div class="empty-state">No se encontraron subcarpetas para procesar.</div>';
        return;
    }

    postsGrid.innerHTML = '';
    const cardsElements = [];
    currentPosts = posts;

    // Calculate stats
    let totalImages = 0;
    posts.forEach(p => totalImages += p.imagesCount);
    document.getElementById('stat-posts').textContent = posts.length;
    document.getElementById('stat-images').textContent = totalImages;

    isCompressingBackground = false;
    currentCompressionRun = null;

    const btnCompressAll = document.getElementById('btn-compress-all');
    const batchContainer = document.getElementById('batch-upload-container');
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'patreon';
    if (activeTab === 'patreon') {
        if (btnCompressAll) {
            btnCompressAll.style.display = 'block';
            btnCompressAll.disabled = false;
            btnCompressAll.textContent = "📦 Iniciar Compresión de Todos los .rar";
            btnCompressAll.style.cursor = "pointer";
            btnCompressAll.style.opacity = "1";
        }
        if (batchContainer) {
            batchContainer.style.display = 'flex';
        }
    } else {
        if (btnCompressAll) btnCompressAll.style.display = 'none';
        if (batchContainer) batchContainer.style.display = 'none';
    }

    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        if (currentSession.donePosts[post.id]) {
            card.classList.add('done');
        }

        const isDone = !!currentSession.donePosts[post.id];

        let thumbnailHtml = `<div class="thumbnail-container">
            <span class="no-thumbnail">No hay imágenes</span>
        </div>`;

        if (post.thumbnail) {
            thumbnailHtml = `<div class="thumbnail-container">
                <img src="${post.thumbnail}" class="thumbnail" alt="Thumbnail">
            </div>`;
        }

        card.innerHTML = `
            <div class="card-header">
                <div class="folder-name">${post.folderName}</div>
                <label class="checkbox-wrapper">
                    <input type="checkbox" style="display:none;" class="done-checkbox" data-id="${post.id}" ${isDone ? 'checked' : ''}>
                    <div class="custom-checkbox">
                        <svg viewBox="0 0 24 24" class="checkmark-svg">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </label>
            </div>
            
            ${thumbnailHtml}
            
            <div class="info-group">
                <div class="info-label">Título para Patreon</div>
                <div class="info-value-container">
                    <textarea class="info-value title-value edit-area">${post.title}</textarea>
                    <button class="copy-btn copy-title" title="Copiar Título">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
            </div>
            
            <div class="info-group">
                <div class="info-label">Tags Generados</div>
                <div class="info-value-container">
                    <textarea class="info-value tags-value edit-area">${post.tags}</textarea>
                    <button class="copy-btn copy-tags" title="Copiar Tags">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
            </div>

            <div class="info-group">
                <div class="info-label">Categoría (Collection Override)</div>
                <div style="display:flex;gap:10px;margin-top:4px;">
                    <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:13px;color:#ccc;">
                        <input type="checkbox" class="category-cb" data-category="Video Games" style="accent-color:#8b5cf6;width:16px;height:16px;cursor:pointer;">
                        Video Games
                    </label>
                    <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:13px;color:#ccc;">
                        <input type="checkbox" class="category-cb" data-category="Animated Series" style="accent-color:#8b5cf6;width:16px;height:16px;cursor:pointer;">
                        Animated Series
                    </label>
                </div>
            </div>

            <div class="card-actions" style="flex-direction: column;">
                <button class="btn primary-btn btn-autofill" title="Autorellenar los datos en una pestaña abierta de Patreon.">Autorellenar en Patreon</button>
                <button class="btn secondary-btn btn-compress">Pendiente de Compresión...</button>
            </div>
        `;

        const checkbox = card.querySelector('.done-checkbox');
        checkbox.addEventListener('change', async (e) => {
            if (e.target.checked) {
                card.classList.add('done');
                currentSession.donePosts[post.id] = true;
            } else {
                card.classList.remove('done');
                delete currentSession.donePosts[post.id];
            }
            await saveSession();
        });

        const btnCopyTitle = card.querySelector('.copy-title');
        btnCopyTitle.addEventListener('click', () => {
            const currentTitle = card.querySelector('.title-value').value;
            navigator.clipboard.writeText(currentTitle);
            btnCopyTitle.style.color = 'var(--success-color)';
            setTimeout(() => btnCopyTitle.style.color = '', 1500);
        });

        const btnCopyTags = card.querySelector('.copy-tags');
        btnCopyTags.addEventListener('click', () => {
            const currentTags = card.querySelector('.tags-value').value;
            navigator.clipboard.writeText(currentTags);
            btnCopyTags.style.color = 'var(--success-color)';
            setTimeout(() => btnCopyTags.style.color = '', 1500);
        });

        // Category checkbox logic (radio-style: only one at a time)
        const categoryCbs = card.querySelectorAll('.category-cb');
        categoryCbs.forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) {
                    categoryCbs.forEach(other => { if (other !== cb) other.checked = false; });
                    post.categoryOverride = cb.dataset.category;
                } else {
                    post.categoryOverride = null;
                }
            });
        });

        // Extension Auto-Fill Event
        const btnAutofill = card.querySelector('.btn-autofill');
        btnAutofill.addEventListener('click', async () => {
            if (btnAutofill.disabled) return alert('Debes esperar a que el .rar asociado termine de generarse para subir a Patreon.');

            // Get current values from editable textareas
            const editedTitle = card.querySelector('.title-value').value;
            const editedBaseTags = card.querySelector('.tags-value').value;

            const btnOriginalText = btnAutofill.textContent;
            btnAutofill.textContent = "Enviando...";

            const scheduleDate = document.getElementById('global-date').value;
            const scheduleTime = document.getElementById('global-time').value;

            const rarPath = post.path + '.rar';

            const collection = post.categoryOverride || post.anime;
            const finalTags = post.categoryOverride ? editedBaseTags + ', ' + post.categoryOverride : editedBaseTags;

            const res = await window.electronAPI.fillPatreon({
                title: editedTitle,
                tags: finalTags,
                anime: collection,
                scheduleDate,
                scheduleTime,
                rarPath: rarPath,
                imagePaths: post.imagePaths
            });

            if (res.receivers > 0) {
                const browserName = currentSession.activeProfile === 'nova' ? 'Opera' : 'Brave';
                btnAutofill.textContent = `¡Enviado a ${browserName}!`;
                btnAutofill.style.background = "var(--success-color)";
            } else {
                btnAutofill.textContent = "No hay extensión conectada";
                btnAutofill.style.background = "#eab308";
            }

            setTimeout(() => {
                btnAutofill.textContent = originalText;
                btnAutofill.style.background = "";
            }, 3000);
        });

        const btnCompress = card.querySelector('.btn-compress');
        
        if (post.hasRar) {
            btnCompress.textContent = "¡Comprimido (Ya existía)!";
            btnCompress.style.background = "var(--success-color)";
            btnCompress.disabled = true;
            btnCompress.style.opacity = "0.7";
        }

        btnCompress.addEventListener('click', async () => {
            btnCompress.textContent = "Comprimiendo manualmente...";
            btnCompress.disabled = true;

            const result = await window.electronAPI.compressFolder(post.path);

            if (result.success) {
                post.hasRar = true;
                btnCompress.textContent = "¡Comprimido!";
                btnCompress.style.background = "var(--success-color)";
                updateGlobalRarStatus(cardsElements);
            } else {
                alert("Error al comprimir: " + result.error);
                btnCompress.textContent = "Reintentar";
                btnCompress.disabled = false;
            }
        });

        // Auto-sizing textareas for Patreon Dashboard
        card.querySelectorAll('.edit-area').forEach(tx => {
            tx.style.height = 'auto';
            tx.style.height = (tx.scrollHeight) + 'px';
            tx.addEventListener('input', () => {
                tx.style.height = 'auto';
                tx.style.height = (tx.scrollHeight) + 'px';
            });
        });

        postsGrid.appendChild(card);
        cardsElements.push({ post, btnCompress, btnAutofill });
    });

    currentCardsElements = cardsElements;
    updateGlobalRarStatus(cardsElements);

    // Also render X Dashboard
    renderTwitterGrid(posts);
}

function generateHashtags(post) {
    const isNova = currentSession.activeProfile === 'nova';
    let base = isNova ? "#nsfw #r34 #rule34" : "#futanari #futanaricomunity #futanariart #futanariai #nsfw #r34 #rule34";

    // Helper to sanitize for hashtags (removes spaces, special chars, keeps Japanese characters)
    const clean = (str) => str ? str.replace(/[^a-zA-Z0-9\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g, "").trim() : "";

    const animeTag = clean(post.anime);
    const charTag = clean(post.character);
    const animeJpTag = clean(post.animeJP);
    const charJpTag = clean(post.characterJP);

    const extra = [animeTag, charTag, animeJpTag, charJpTag]
        .filter(t => t.length > 0)
        .map(t => "#" + t)
        .join(" ");

    return `${base} ${extra}`.trim();
}

function renderTwitterGrid(posts) {
    const twitterGrid = document.getElementById('twitter-grid');
    twitterGrid.innerHTML = '';

    // Si la pestaña de X está activa, disparar obtención automática de links en segundo plano
    const dashTwitter = document.getElementById('dashboard-twitter');
    if (dashTwitter && !dashTwitter.classList.contains('hidden')) {
        autoFetchPatreonLinks(true);
    }

    // Create a shuffled pool of unique texts
    let textPool = [...twitterTexts].sort(() => Math.random() - 0.5);

    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';

        // Pick a unique text, refill pool if empty
        if (textPool.length === 0) {
            textPool = [...twitterTexts].sort(() => Math.random() - 0.5);
        }
        const randomText = textPool.pop();
        const hashtags = generateHashtags(post);

        const savedSched = currentSession.twitterSchedule?.[post.id];
        const defaultDate = savedSched?.date || document.getElementById('global-date')?.value || new Date().toISOString().split('T')[0];
        const defaultTime = savedSched?.time || document.getElementById('global-time')?.value || "12:00";

        let thumbnailHtml = `<div class="thumbnail-container">
            <span class="no-thumbnail">No hay imágenes</span>
        </div>`;

        if (post.thumbnail) {
            thumbnailHtml = `<div class="thumbnail-container">
                <img src="${post.thumbnail}" class="thumbnail" alt="Thumbnail">
            </div>`;
        }

        card.innerHTML = `
            <div class="card-header">
                <div class="folder-name">${post.folderName}</div>
                <div style="color: #1DA1F2;">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </div>
            </div>
            
            ${thumbnailHtml}
            
            <div class="info-group">
                <div class="info-label">Texto Sugerente (EN)</div>
                <div class="info-value-container">
                    <textarea class="info-value twitter-text edit-area edit-en" style="color: #60a5fa; border-left-color: #60a5fa;">${randomText.en}</textarea>
                    <button class="copy-btn btn-copy-en" title="Copiar Texto EN">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
            </div>
            
            <div class="info-group">
                <div class="info-label">Texto Sugerente (ES)</div>
                <div class="info-value-container">
                    <textarea class="info-value twitter-text edit-area edit-es">${randomText.es}</textarea>
                    <button class="copy-btn btn-copy-es" title="Copiar Texto ES">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
            </div>

            <div class="info-group">
                <div class="info-label">Tags Dinámicos (Perfil: ${currentSession.activeProfile})</div>
                <div class="info-value-container">
                    <textarea class="info-value tags-value edit-area edit-tags" style="font-size: 0.85rem;">${hashtags}</textarea>
                    <button class="copy-btn btn-copy-tags" title="Copiar Tags">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
            </div>

            <div class="info-group">
                <div class="info-label">Link de Patreon</div>
                <div class="info-value-container">
                    <textarea class="info-value edit-area edit-patreon-link" id="patreon-link-${post.id}" placeholder="Link aparecerá aquí..." style="color: #f472b6; border-left-color: #f472b6;"></textarea>
                    <button class="copy-btn btn-copy-link" title="Copiar Link">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
            </div>

            <div class="info-group schedule-group" style="background: rgba(255, 255, 255, 0.03); padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); margin-top: 0.75rem;">
                <div class="info-label" style="display: flex; justify-content: space-between; align-items: center; color: #38bdf8; font-weight: 600;">
                    <span>📅 Fecha y Hora de Programación (Individual)</span>
                    <button type="button" class="btn-sync-date" title="Copiar fecha y hora general" style="background: none; border: none; color: #94a3b8; font-size: 0.75rem; cursor: pointer; text-decoration: underline;">↻ Usar General</button>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
                    <div style="flex: 1;">
                        <label style="font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 2px;">Fecha</label>
                        <input type="date" class="glass-input twitter-post-date" value="${defaultDate}" style="width: 100%; padding: 0.4rem 0.6rem; font-size: 0.85rem; border-radius: 6px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 2px;">Hora (24hs)</label>
                        <input type="time" class="glass-input twitter-post-time" value="${defaultTime}" style="width: 100%; padding: 0.4rem 0.6rem; font-size: 0.85rem; border-radius: 6px;">
                    </div>
                </div>
            </div>

            <div class="card-actions" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                <button class="btn secondary-btn btn-copy-all" style="width: 100%; font-size: 0.85rem; padding: 0.5rem; border: 1px solid rgba(255,255,255,0.15);">📋 Copiar Todo (EN + ES + Link + Tags)</button>
                <button class="btn primary-btn btn-schedule-x" style="width: 100%; background: linear-gradient(135deg, #1DA1F2, #0d8bd9); font-weight: 600; font-size: 0.95rem; padding: 0.65rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    <span class="btn-schedule-x-text">Preparar y Programar en X</span>
                </button>
            </div>
        `;

        const setupCopy = (selector, textareaSelector) => {
            const btn = card.querySelector(selector);
            btn.addEventListener('click', () => {
                const text = card.querySelector(textareaSelector).value;
                navigator.clipboard.writeText(text);
                const originalColor = btn.style.color;
                btn.style.color = 'var(--success-color)';
                setTimeout(() => btn.style.color = originalColor, 1000);
            });
        };

        setupCopy('.btn-copy-en', '.edit-en');
        setupCopy('.btn-copy-es', '.edit-es');
        setupCopy('.btn-copy-tags', '.edit-tags');
        setupCopy('.btn-copy-link', '.edit-patreon-link');

        const btnCopyAll = card.querySelector('.btn-copy-all');
        btnCopyAll.addEventListener('click', () => {
            const enText = card.querySelector('.edit-en').value;
            const esText = card.querySelector('.edit-es').value;
            const tagsText = card.querySelector('.edit-tags').value;
            const patreonLink = card.querySelector('.edit-patreon-link').value;

            // Text in english, text in spanish, 1 line break, link, 1 line break, tags
            const linkPart = patreonLink ? `${patreonLink}\n\n` : '';
            const combinedText = `${enText}\n${esText}\n\n${linkPart}${tagsText}`;
            navigator.clipboard.writeText(combinedText);

            const originalText = btnCopyAll.textContent;
            const originalBg = btnCopyAll.style.background;
            btnCopyAll.textContent = '¡Copiado Todo!';
            btnCopyAll.style.background = 'var(--success-color)';
            setTimeout(() => {
                btnCopyAll.textContent = originalText;
                btnCopyAll.style.background = originalBg;
            }, 1500);
        });

        // Manejo individual de fecha y hora
        const dateInput = card.querySelector('.twitter-post-date');
        const timeInput = card.querySelector('.twitter-post-time');
        const updateSavedSchedule = () => {
            if (!currentSession.twitterSchedule) currentSession.twitterSchedule = {};
            currentSession.twitterSchedule[post.id] = {
                date: dateInput.value,
                time: timeInput.value
            };
            saveSession();
            syncTwitterFeedToMain();
        };
        dateInput.addEventListener('change', updateSavedSchedule);
        timeInput.addEventListener('change', updateSavedSchedule);

        const btnSyncDate = card.querySelector('.btn-sync-date');
        btnSyncDate.addEventListener('click', () => {
            const gDate = document.getElementById('global-date')?.value;
            const gTime = document.getElementById('global-time')?.value;
            if (gDate) dateInput.value = gDate;
            if (gTime) timeInput.value = gTime;
            updateSavedSchedule();
        });

        // Botón principal de preparación y programación en X
        const btnScheduleX = card.querySelector('.btn-schedule-x');
        const btnScheduleText = card.querySelector('.btn-schedule-x-text');

        btnScheduleX.addEventListener('click', async () => {
            btnScheduleX.disabled = true;
            const originalBg = btnScheduleX.style.background;
            const originalText = btnScheduleText.textContent;

            try {
                // 1. Obtener links del Patreon si aún no están cargados
                let patreonLink = card.querySelector('.edit-patreon-link').value.trim();
                if (!patreonLink) {
                    if (isFetchingPatreon && patreonFetchPromise) {
                        btnScheduleText.textContent = "🔗 Esperando links de Patreon...";
                        await patreonFetchPromise;
                    } else {
                        btnScheduleText.textContent = "🔗 Obteniendo links de Patreon...";
                        await autoFetchPatreonLinks(true);
                    }
                    patreonLink = card.querySelector('.edit-patreon-link').value.trim();
                }

                // 2. Cargar texto correspondiente (mismo que Copiar Todo)
                const enText = card.querySelector('.edit-en').value;
                const esText = card.querySelector('.edit-es').value;
                const tagsText = card.querySelector('.edit-tags').value;
                const linkPart = patreonLink ? `${patreonLink}\n\n` : '';
                const combinedText = `${enText}\n${esText}\n\n${linkPart}${tagsText}`;

                // Copiar al portapapeles para conveniencia
                await window.electronAPI.copyClipboard(combinedText);

                // 3. Cargar las primeras 4 imágenes de la carpeta con marca de agua
                btnScheduleText.textContent = "🖼️ Buscando imágenes con marca de agua...";
                const watermarkImages = await window.electronAPI.getWatermarkImages(post.path);

                // 4. Obtener fecha y hora elegidas en el card
                const schedDate = dateInput.value;
                const schedTime = timeInput.value;

                // 5. Enviar payload a Electron y abrir X
                btnScheduleText.textContent = "🚀 Abriendo X (Twitter)...";
                await window.electronAPI.fillTwitter({
                    text: combinedText,
                    imagePaths: watermarkImages,
                    scheduleDate: schedDate,
                    scheduleTime: schedTime
                });

                await window.electronAPI.openTwitter(currentSession.activeProfile);

                btnScheduleText.textContent = "✅ Enviado a X";
                btnScheduleX.style.background = "var(--success-color)";
                setTimeout(() => {
                    btnScheduleX.disabled = false;
                    btnScheduleText.textContent = originalText;
                    btnScheduleX.style.background = originalBg;
                }, 3500);

            } catch (err) {
                console.error("Error al programar en X:", err);
                alert("Error al preparar el post para X: " + err.message);
                btnScheduleX.disabled = false;
                btnScheduleText.textContent = originalText;
                btnScheduleX.style.background = originalBg;
            }
        });

        // Auto-sizing textareas
        card.querySelectorAll('textarea').forEach(tx => {
            tx.style.height = 'auto';
            tx.style.height = (tx.scrollHeight) + 'px';
            tx.addEventListener('input', () => {
                tx.style.height = 'auto';
                tx.style.height = (tx.scrollHeight) + 'px';
                syncTwitterFeedToMain();
            });
        });

        twitterGrid.appendChild(card);
    });

    syncTwitterFeedToMain();
}

let syncTwitterTimeout = null;
async function syncTwitterFeedToMain(immediate = false) {
    if (syncTwitterTimeout) clearTimeout(syncTwitterTimeout);
    const doSync = async () => {
        const cards = document.querySelectorAll('#twitter-grid .post-card');
        if (cards.length === 0 || !currentPosts || currentPosts.length === 0) {
            if (window.electronAPI && window.electronAPI.setTwitterFeed) {
                await window.electronAPI.setTwitterFeed({ posts: [], currentIndex: 0 });
            }
            return;
        }

        const feedPosts = [];
        for (let i = 0; i < currentPosts.length; i++) {
            const post = currentPosts[i];
            const card = cards[i];
            if (!card) continue;

            const enText = card.querySelector('.edit-en')?.value || '';
            const esText = card.querySelector('.edit-es')?.value || '';
            const tagsText = card.querySelector('.edit-tags')?.value || '';
            const patreonLink = card.querySelector('.edit-patreon-link')?.value || '';
            const dateInput = card.querySelector('.twitter-post-date');
            const timeInput = card.querySelector('.twitter-post-time');

            const linkPart = patreonLink.trim() ? `${patreonLink.trim()}\n\n` : '';
            const combinedText = `${enText}\n${esText}\n\n${linkPart}${tagsText}`.trim();

            if (!post.watermarkImages) {
                try {
                    post.watermarkImages = await window.electronAPI.getWatermarkImages(post.path);
                } catch (e) {
                    post.watermarkImages = [];
                }
            }

            const thumbPath = (post.imagePaths && post.imagePaths[0]) ? post.imagePaths[0] : (post.watermarkImages && post.watermarkImages[0] ? post.watermarkImages[0] : (post.path ? post.path : ''));

            feedPosts.push({
                id: post.id,
                index: i,
                folderName: post.folderName,
                characterName: getCleanCharacterName(post.folderName),
                path: post.path,
                thumbnailPath: thumbPath,
                watermarkImages: post.watermarkImages || [],
                enText: enText,
                esText: esText,
                tags: tagsText,
                patreonLink: patreonLink,
                combinedText: combinedText,
                scheduleDate: dateInput?.value || '',
                scheduleTime: timeInput?.value || ''
            });
        }

        if (window.electronAPI && window.electronAPI.setTwitterFeed) {
            await window.electronAPI.setTwitterFeed({
                posts: feedPosts,
                currentIndex: 0
            });
        }
    };

    if (immediate) {
        await doSync();
    } else {
        syncTwitterTimeout = setTimeout(doSync, 250);
    }
}

if (window.electronAPI && window.electronAPI.onTwitterPostUpdated) {
    window.electronAPI.onTwitterPostUpdated((updated) => {
        if (!updated || !updated.id) return;
        const cards = document.querySelectorAll('#twitter-grid .post-card');
        cards.forEach((card, idx) => {
            const post = currentPosts && currentPosts[idx];
            if (post && post.id === updated.id) {
                if (updated.scheduleDate) {
                    const dInput = card.querySelector('.twitter-post-date');
                    if (dInput) dInput.value = updated.scheduleDate;
                }
                if (updated.scheduleTime) {
                    const tInput = card.querySelector('.twitter-post-time');
                    if (tInput) tInput.value = updated.scheduleTime;
                }
            }
        });
    });
}

async function startBackgroundCompression(elements, runToken) {
    for (const item of elements) {
        if (currentCompressionRun !== runToken) return;

        const { post, btnCompress } = item;

        if (btnCompress.disabled || btnCompress.textContent.includes("Comprimido")) continue;

        btnCompress.textContent = "Generando .rar autom. ...";
        btnCompress.disabled = true;

        const result = await window.electronAPI.compressFolder(post.path);

        if (currentCompressionRun !== runToken) return;

        if (result.success) {
            post.hasRar = true;
            btnCompress.textContent = "¡Comprimido en 2do plano!";
            btnCompress.disabled = true;
            btnCompress.style.background = "var(--success-color)";
            btnCompress.style.opacity = "0.7";
            updateGlobalRarStatus(elements);
        } else {
            console.error("Error comprimiendo", post.path, result.error);
            btnCompress.textContent = "Reintentar comprimir";
            btnCompress.disabled = false;
        }
    }
}

// ==================== GESTOR DE CARPETAS LOGIC ====================

function getCleanCharacterName(rawName) {
    if (!rawName) return '';
    return rawName
        .replace(/\s*-\s*\[Nicky\]/gi, '')
        .replace(/\s*\[Nicky\]/gi, '')
        .replace(/\s*-\s*\[Nova\]/gi, '')
        .replace(/\s*\[Nova\]/gi, '')
        .trim();
}

let gestorState = {
    months: [],
    selectedMonth: null,
    selectedDate: null,
    outputCharacters: []
};

async function loadGestorData() {
    if (!currentSession.baseOrgPath) return;
    const select = document.getElementById('gestor-month-select');
    
    gestorState.months = await window.electronAPI.getOrgFolders(currentSession.baseOrgPath);
    
    select.innerHTML = '<option value="">-- Selecciona un Mes --</option>';
    gestorState.months.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        select.appendChild(opt);
    });

    if (gestorState.selectedMonth) {
        select.value = gestorState.selectedMonth;
        renderGestorDates(gestorState.selectedMonth);
    }
}

function renderGestorDates(monthName) {
    gestorState.selectedMonth = monthName;
    const monthData = gestorState.months.find(m => m.name === monthName);
    const container = document.getElementById('gestor-dates-list');
    
    if (!monthData) {
        container.innerHTML = '<div style="color: #64748b; font-size: 0.9rem; text-align: center; padding: 1rem; width: 100%;">Selecciona un mes primero</div>';
        return;
    }

    container.innerHTML = '';
    if (monthData.dates.length === 0) {
        container.innerHTML = '<div style="color: #64748b; font-size: 0.9rem; padding: 0.5rem; width: 100%;">No hay fechas en este mes.</div>';
    } else {
        const sortedDates = monthData.dates.sort((a, b) => a.name.localeCompare(b.name));
        sortedDates.forEach(d => {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'display: flex; align-items: stretch; gap: 0; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2); transition: all 0.2s;';

            if (!currentSession.doneDates) currentSession.doneDates = {};
            const dateId = `${monthName}_${d.name}`;
            const isDone = !!currentSession.doneDates[dateId];

            const cbWrapper = document.createElement('div');
            cbWrapper.style.cssText = `display: flex; align-items: center; justify-content: center; padding: 0 0.5rem; background: ${isDone ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.2)'}; border-right: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s;`;
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = isDone;
            cb.style.cssText = 'cursor: pointer; width: 16px; height: 16px; accent-color: #8b5cf6; margin: 0;';
            
            cb.onchange = async (e) => {
                currentSession.doneDates[dateId] = e.target.checked;
                cbWrapper.style.background = e.target.checked ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.2)';
                await saveSession();
            };
            cbWrapper.onclick = (e) => {
                if (e.target !== cb) {
                    cb.checked = !cb.checked;
                    cb.dispatchEvent(new Event('change'));
                }
            };
            cbWrapper.appendChild(cb);

            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.style.cssText = `border: none; background: ${gestorState.selectedDate === d.name ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255,255,255,0.05)'}; color: #fff; padding: 0.5rem 1rem; border-radius: 0; cursor: pointer; transition: all 0.2s; flex: 1;`;
            btn.textContent = d.name;
            btn.onclick = () => {
                gestorState.selectedDate = d.name;
                renderGestorDates(monthName);
                updateCharacterMoveButtons(); 
                loadDateCharacters();
            };
            btn.oncontextmenu = (e) => {
                e.preventDefault();
                showDateContextMenu(e.clientX, e.clientY, monthName, d.name);
            };

            wrapper.appendChild(cbWrapper);
            wrapper.appendChild(btn);
            container.appendChild(wrapper);

            // Fetch contents to color code the wrapper
            const targetPath = `${currentSession.baseOrgPath}\\${monthName}\\${d.name}`;
            window.electronAPI.readFolder(targetPath).then(allPosts => {
                const characters = allPosts.filter(post => !post.folderName.toLowerCase().includes('nova'));
                if (characters.length > 0) {
                    const allDone = characters.every(c => currentSession.qcDone && currentSession.qcDone[c.folderName]);
                    if (allDone) {
                        // levemente verdosas
                        wrapper.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                        btn.style.background = gestorState.selectedDate === d.name ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.1)';
                        wrapper.style.boxShadow = '0 0 8px rgba(34, 197, 94, 0.3)';
                    } else {
                        // levemente rojas
                        wrapper.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                        btn.style.background = gestorState.selectedDate === d.name ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.1)';
                        wrapper.style.boxShadow = '0 0 8px rgba(239, 68, 68, 0.3)';
                    }
                }
            }).catch(err => console.error("Error reading folder for color coding:", err));
        });
    }
}

let contextMenuTarget = null;
let charContextMenuTarget = null;

function hideCharContextMenu() {
    const menu = document.getElementById('character-context-menu');
    if (menu) {
        menu.style.display = 'none';
        menu.classList.add('hidden');
    }
    charContextMenuTarget = null;
}

function showCharacterContextMenu(x, y, post, card = null) {
    const dateMenu = document.getElementById('date-context-menu');
    if (dateMenu) {
        dateMenu.style.display = 'none';
        dateMenu.classList.add('hidden');
    }

    charContextMenuTarget = {
        path: post.path,
        folderName: post.folderName || 'Carpeta',
        isRootOutput: !!post.isRootOutput,
        card: card,
        novaPath: null
    };

    const menu = document.getElementById('character-context-menu');
    if (!menu) return;

    const titleEl = document.getElementById('char-ctx-title');
    if (titleEl) {
        titleEl.textContent = `📁 ${getCleanCharacterName(post.folderName || 'Carpeta')}`;
    }

    const btnNova = document.getElementById('char-ctx-abrir-nova');
    const btnVerFotos = document.getElementById('char-ctx-ver-fotos');
    const btnRenombrar = document.getElementById('char-ctx-renombrar');
    const btnAbrir = document.getElementById('char-ctx-abrir');

    if (btnNova) btnNova.style.display = 'none';

    if (post.isRootOutput) {
        if (btnAbrir) btnAbrir.textContent = '📂 Abrir carpeta Output';
        if (btnVerFotos) btnVerFotos.style.display = 'none';
        if (btnRenombrar) btnRenombrar.style.display = 'none';
    } else {
        if (btnAbrir) btnAbrir.textContent = '📂 Abrir en explorador';
        if (btnVerFotos) btnVerFotos.style.display = 'flex';
        if (btnRenombrar) btnRenombrar.style.display = 'flex';

        if (btnNova && window.electronAPI.getNovaFolderPath && post.path) {
            window.electronAPI.getNovaFolderPath(post.path, currentSession.baseOrgPath, currentSession.novaOrgPath)
                .then(novaPath => {
                    if (novaPath && charContextMenuTarget && charContextMenuTarget.path === post.path) {
                        charContextMenuTarget.novaPath = novaPath;
                        btnNova.style.display = 'flex';
                    }
                })
                .catch(err => console.error("Error comprobando carpeta Nova:", err));
        }
    }

    menu.style.display = 'flex';
    menu.classList.remove('hidden');

    const menuWidth = 220;
    const menuHeight = post.isRootOutput ? 90 : 180;
    let posX = x;
    let posY = y;
    if (posX + menuWidth > window.innerWidth) posX = window.innerWidth - menuWidth - 10;
    if (posY + menuHeight > window.innerHeight) posY = window.innerHeight - menuHeight - 10;
    if (posX < 10) posX = 10;
    if (posY < 10) posY = 10;

    menu.style.left = `${posX}px`;
    menu.style.top = `${posY}px`;
}

function showDateContextMenu(x, y, monthName, dateName) {
    hideCharContextMenu();
    contextMenuTarget = { month: monthName, date: dateName };
    const menu = document.getElementById('date-context-menu');
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.display = 'flex';
    menu.classList.remove('hidden');
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('date-context-menu');
    if (menu && !menu.contains(e.target)) {
        menu.style.display = 'none';
        menu.classList.add('hidden');
    }
    const charMenu = document.getElementById('character-context-menu');
    if (charMenu && !charMenu.contains(e.target)) {
        hideCharContextMenu();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const menu = document.getElementById('date-context-menu');
        if (menu) {
            menu.style.display = 'none';
            menu.classList.add('hidden');
        }
        hideCharContextMenu();
    }
});

window.addEventListener('scroll', () => {
    const menu = document.getElementById('date-context-menu');
    if (menu) {
        menu.style.display = 'none';
        menu.classList.add('hidden');
    }
    hideCharContextMenu();
}, true);

let moveCharState = {
    charName: null,
    sourceMonth: null,
    sourceDate: null
};

async function loadDateCharacters() {
    const container = document.getElementById('gestor-date-contents-list');
    const countEl = document.getElementById('gestor-date-contents-count');
    
    if (!gestorState.selectedMonth || !gestorState.selectedDate || !currentSession.baseOrgPath) {
        container.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;">Selecciona una fecha arriba para ver sus personajes.</div>';
        countEl.textContent = '0 encontrados';
        return;
    }

    container.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;">Cargando...</div>';
    
    const targetPath = `${currentSession.baseOrgPath}\\${gestorState.selectedMonth}\\${gestorState.selectedDate}`;
    const allPosts = await window.electronAPI.readFolder(targetPath);
    
    const characters = allPosts.filter(post => !post.folderName.toLowerCase().includes('nova'));
    countEl.textContent = `${characters.length} encontrados (Ocultando versiones Nova)`;

    container.innerHTML = '';
    if (characters.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;">No hay personajes en esta fecha.</div>';
        return;
    }

    if (currentSession.viewMode === 'list') {
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '0.5rem';
    } else {
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        container.style.gap = '1rem';
    }

    characters.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card' + (currentSession.specialRequests && currentSession.specialRequests[post.folderName] ? ' special-request' : '');
        card.tabIndex = 0;
        card.title = "Clic derecho: abrir en explorador / opciones";
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showCharacterContextMenu(e.clientX, e.clientY, post, card);
        });
        if (currentSession.viewMode === 'list') {
            card.style.cssText = "padding: 1rem; display: flex; flex-direction: row; align-items: center; gap: 1rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 0;";
            card.innerHTML = `
                <div class="char-name-container" style="font-weight: 600; font-size: 0.95rem; color: #fff; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" title="Doble clic para renombrar">${getCleanCharacterName(post.folderName)}</div>
                <div style="font-size: 0.8rem; color: #94a3b8; width: 80px; text-align: center;">${post.imagesCount} Img</div>
                <button class="btn btn-view-images" style="background: rgba(139, 92, 246, 0.2); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.4); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer; white-space: nowrap;">🖼️ Ver Imágenes</button>
                <button class="btn btn-qc" style="background: ${isQcDone ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)'}; color: ${isQcDone ? '#4ade80' : '#fff'}; border: 1px solid ${isQcDone ? '#4ade80' : 'rgba(255,255,255,0.2)'}; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer; white-space: nowrap; width: 80px;" title="Marcar Control de Calidad">
                    ${isQcDone ? '✅ QC OK' : '❌ Sin QC'}
                </button>
                <button class="btn secondary-btn btn-move" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; white-space: nowrap;">
                    Mover a...
                </button>
            `;
        } else {
            card.style.cssText = "padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;";
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="char-name-container" style="font-weight: 600; font-size: 0.95rem; color: #fff; word-break: break-all; cursor: pointer;" title="Doble clic para renombrar">${getCleanCharacterName(post.folderName)}</div>
                    <button class="btn btn-qc" style="background: ${isQcDone ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)'}; color: ${isQcDone ? '#4ade80' : '#fff'}; border: 1px solid ${isQcDone ? '#4ade80' : 'rgba(255,255,255,0.2)'}; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer;" title="Marcar Control de Calidad">
                        ${isQcDone ? '✅ QC OK' : '❌ Sin QC'}
                    </button>
                </div>
                <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.2rem;">${post.imagesCount} Imágenes</div>
                <button class="btn btn-view-images" style="background: rgba(139, 92, 246, 0.2); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.4); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer; margin-top: 0.2rem;">🖼️ Ver Imágenes</button>
                <button class="btn secondary-btn btn-move" style="margin-top: auto; padding: 0.4rem; font-size: 0.85rem;">
                    Mover a otra fecha...
                </button>
            `;
        }

        const btnViewImages = card.querySelector('.btn-view-images');
        btnViewImages.onclick = () => openImageViewer(post.path, post.folderName);

        const nameContainer = card.querySelector('.char-name-container');
        if (nameContainer) {
            nameContainer.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                handleRenameCharacter(nameContainer, post.path, post.folderName, false);
            });
        }

        const btnQc = card.querySelector('.btn-qc');
        btnQc.onclick = async () => {
            const currentQc = currentSession.qcDone && currentSession.qcDone[post.folderName];
            if (currentQc) {
                currentSession.qcDone[post.folderName] = false;
                btnQc.innerHTML = '❌ Sin QC';
                btnQc.style.background = 'rgba(255,255,255,0.1)';
                btnQc.style.color = '#fff';
                btnQc.style.borderColor = 'rgba(255,255,255,0.2)';
            } else {
                if (!currentSession.qcDone) currentSession.qcDone = {};
                currentSession.qcDone[post.folderName] = true;
                btnQc.innerHTML = '✅ QC OK';
                btnQc.style.background = 'rgba(34, 197, 94, 0.2)';
                btnQc.style.color = '#4ade80';
                btnQc.style.borderColor = '#4ade80';
            }
            await saveSession();
            renderGestorDates(gestorState.selectedMonth); // refresh button colors
        };

        const btnMove = card.querySelector('.btn-move');
        btnMove.onclick = () => {
            openMoveCharModal(post.folderName, gestorState.selectedMonth, gestorState.selectedDate);
        };
        
        container.appendChild(card);
    });
}

function openMoveCharModal(charName, sourceMonth, sourceDate) {
    moveCharState = { charName, sourceMonth, sourceDate };
    
    document.getElementById('move-char-name-label').textContent = `Personaje: ${charName}`;
    
    const monthSelect = document.getElementById('move-char-month-select');
    monthSelect.innerHTML = '<option value="">-- Selecciona un Mes --</option>';
    gestorState.months.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        monthSelect.appendChild(opt);
    });
    monthSelect.value = sourceMonth;
    
    updateMoveCharDateSelect(sourceMonth);
    
    const dateSelect = document.getElementById('move-char-date-select');
    dateSelect.value = sourceDate;

    const modal = document.getElementById('move-character-modal');
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function updateMoveCharDateSelect(monthName) {
    const dateSelect = document.getElementById('move-char-date-select');
    dateSelect.innerHTML = '';
    
    const monthData = gestorState.months.find(m => m.name === monthName);
    if (!monthData || monthData.dates.length === 0) {
        dateSelect.innerHTML = '<option value="">No hay fechas</option>';
        return;
    }
    
    monthData.dates.sort((a, b) => a.name.localeCompare(b.name)).forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.name;
        opt.textContent = d.name;
        dateSelect.appendChild(opt);
    });
}

async function loadGestorCharacters() {
    const container = document.getElementById('gestor-characters-list');
    const countEl = document.getElementById('gestor-output-count');
    
    if (!currentSession.outputPath) {
        container.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;">Configura la Carpeta Output en Ajustes y Refresca.</div>';
        countEl.textContent = '0 encontrados';
        return;
    }

    container.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;">Cargando...</div>';
    
    const allPosts = await window.electronAPI.readFolder(currentSession.outputPath);
    // Filtrar los de nova
    gestorState.outputCharacters = allPosts.filter(post => !post.folderName.toLowerCase().includes('nova'));
    
    renderGestorCharactersList();
}

function renderGestorCharactersList() {
    const container = document.getElementById('gestor-characters-list');
    const countEl = document.getElementById('gestor-output-count');
    
    if (!gestorState.outputCharacters) return;

    let verifiedCount = 0;
    let unverifiedCount = 0;
    gestorState.outputCharacters.forEach(c => {
        if (currentSession.qcDone && currentSession.qcDone[c.folderName]) {
            verifiedCount++;
        } else {
            unverifiedCount++;
        }
    });
    countEl.innerHTML = `${gestorState.outputCharacters.length} encontrados <span style="color: #4ade80;">(${verifiedCount} verificados)</span> <span style="color: #f87171;">(${unverifiedCount} faltan)</span> (Ocultando versiones Nova)`;

    const sortType = document.getElementById('gestor-output-sort') ? document.getElementById('gestor-output-sort').value : 'alpha';
    if (sortType === 'alpha' || sortType === 'featured') {
        gestorState.outputCharacters.sort((a, b) => a.folderName.localeCompare(b.folderName));
    } else if (sortType === 'alpha-desc') {
        gestorState.outputCharacters.sort((a, b) => b.folderName.localeCompare(a.folderName));
    } else if (sortType === 'date-desc') {
        gestorState.outputCharacters.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (sortType === 'date-asc') {
        gestorState.outputCharacters.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    }

    const featured = currentSession.featuredCharacters || {};
    gestorState.visibleCharacters = sortType === 'featured'
        ? gestorState.outputCharacters.filter(c => featured[c.folderName])
        : gestorState.outputCharacters;

    container.innerHTML = '';
    if (gestorState.visibleCharacters.length === 0) {
        container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">${sortType === 'featured' ? 'No hay personajes destacados.' : 'No hay personajes en Output.'}</div>`;
        return;
    }

    if (currentSession.viewMode === 'list') {
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '0.5rem';
    } else {
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        container.style.gap = '1rem';
    }

    gestorState.visibleCharacters.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card' + (currentSession.specialRequests && currentSession.specialRequests[post.folderName] ? ' special-request' : '');
        card.tabIndex = 0;
        card.title = "Clic derecho: abrir en explorador / opciones";
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showCharacterContextMenu(e.clientX, e.clientY, post, card);
        });
        card.style.cssText = "padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;";
        
        card.addEventListener('keydown', async (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                if (!currentSession.specialRequests) currentSession.specialRequests = {};
                currentSession.specialRequests[post.folderName] = !currentSession.specialRequests[post.folderName];
                if (currentSession.specialRequests[post.folderName]) {
                    card.classList.add('special-request');
                } else {
                    card.classList.remove('special-request');
                }
                await window.electronAPI.saveSession(currentSession);
                
                // Actualizar también en la otra lista si es visible
                if (gestorState.selectedMonth && gestorState.selectedDate) {
                    renderGestorDateContentsList();
                }
            }
        });
        
        
        const novaBadge = ''; // Ya no mostramos la placa Nova porque solo mostramos los Nicky
        const isQcDone = currentSession.qcDone && currentSession.qcDone[post.folderName];
        const isFeatured = !!featured[post.folderName];
        const starBtn = `<button class="btn btn-feature" style="background: ${isFeatured ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255,255,255,0.1)'}; color: ${isFeatured ? '#facc15' : '#94a3b8'}; border: 1px solid ${isFeatured ? '#facc15' : 'rgba(255,255,255,0.2)'}; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer;" title="${isFeatured ? 'Quitar de destacados' : 'Destacar personaje'}">${isFeatured ? '★' : '☆'}</button>`;

        if (currentSession.viewMode === 'list') {
            card.style.cssText = "padding: 1rem; display: flex; flex-direction: row; align-items: center; gap: 1rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 0;";
            card.innerHTML = `
                <div class="char-name-container" style="font-weight: 600; font-size: 0.95rem; color: #fff; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" title="Doble clic para renombrar">${getCleanCharacterName(post.folderName)} ${novaBadge}</div>
                ${starBtn}
                <div style="font-size: 0.8rem; color: #94a3b8; width: 80px; text-align: center;">${post.imagesCount} Img</div>
                <button class="btn btn-view-images" style="background: rgba(139, 92, 246, 0.2); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.4); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer; white-space: nowrap;">🖼️ Ver Imágenes</button>
                <button class="btn btn-qc" style="background: ${isQcDone ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)'}; color: ${isQcDone ? '#4ade80' : '#fff'}; border: 1px solid ${isQcDone ? '#4ade80' : 'rgba(255,255,255,0.2)'}; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer; white-space: nowrap; width: 80px;" title="Marcar Control de Calidad">
                    ${isQcDone ? '✅ QC OK' : '❌ Sin QC'}
                </button>
                <button class="btn primary-btn btn-move" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; white-space: nowrap;" ${!gestorState.selectedDate ? 'disabled' : ''}>
                    Mover a ${gestorState.selectedDate || 'Fecha no seleccionada'}
                </button>
            `;
        } else {
            card.style.cssText = "padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;";
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="char-name-container" style="font-weight: 600; font-size: 0.95rem; color: #fff; word-break: break-all; cursor: pointer;" title="Doble clic para renombrar">${getCleanCharacterName(post.folderName)} ${novaBadge}</div>
                    <div style="display: flex; gap: 0.3rem;">${starBtn}
                    <button class="btn btn-qc" style="background: ${isQcDone ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)'}; color: ${isQcDone ? '#4ade80' : '#fff'}; border: 1px solid ${isQcDone ? '#4ade80' : 'rgba(255,255,255,0.2)'}; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer;" title="Marcar Control de Calidad">
                        ${isQcDone ? '✅ QC OK' : '❌ Sin QC'}
                    </button></div>
                </div>
                <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.2rem;">${post.imagesCount} Imágenes</div>
                <button class="btn btn-view-images" style="background: rgba(139, 92, 246, 0.2); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.4); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer; margin-top: 0.2rem;">🖼️ Ver Imágenes</button>
                <button class="btn primary-btn btn-move" style="margin-top: auto; padding: 0.4rem; font-size: 0.85rem;" ${!gestorState.selectedDate ? 'disabled' : ''}>
                    Mover a ${gestorState.selectedDate || 'Fecha no seleccionada'}
                </button>
            `;
        }

        const btnViewImages = card.querySelector('.btn-view-images');
        btnViewImages.onclick = () => openImageViewer(post.path, post.folderName);

        card.querySelector('.btn-feature').onclick = async () => {
            if (!currentSession.featuredCharacters) currentSession.featuredCharacters = {};
            if (isFeatured) delete currentSession.featuredCharacters[post.folderName];
            else currentSession.featuredCharacters[post.folderName] = true;
            await saveSession();
            renderGestorCharactersList();
        };

        const nameContainer = card.querySelector('.char-name-container');
        if (nameContainer) {
            nameContainer.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                handleRenameCharacter(nameContainer, post.path, post.folderName, false);
            });
        }

        const btnQc = card.querySelector('.btn-qc');
        btnQc.onclick = async () => {
            const currentQc = currentSession.qcDone && currentSession.qcDone[post.folderName];
            if (currentQc) {
                currentSession.qcDone[post.folderName] = false;
                btnQc.innerHTML = '❌ Sin QC';
                btnQc.style.background = 'rgba(255,255,255,0.1)';
                btnQc.style.color = '#fff';
                btnQc.style.borderColor = 'rgba(255,255,255,0.2)';
            } else {
                if (!currentSession.qcDone) currentSession.qcDone = {};
                currentSession.qcDone[post.folderName] = true;
                btnQc.innerHTML = '✅ QC OK';
                btnQc.style.background = 'rgba(34, 197, 94, 0.2)';
                btnQc.style.color = '#4ade80';
                btnQc.style.borderColor = '#4ade80';
            }
            await saveSession();
            if (gestorState.selectedMonth) {
                renderGestorDates(gestorState.selectedMonth); // refresh button colors
            }
        };

        const btnMove = card.querySelector('.btn-move');
        if (gestorState.selectedDate) {
            btnMove.onclick = async () => {
                if (!gestorState.selectedMonth || !gestorState.selectedDate) return;
                
                btnMove.textContent = "Moviendo...";
                btnMove.disabled = true;

                const result = await window.electronAPI.moveCharacterFolder(
                    post.path,
                    currentSession.baseOrgPath,
                    currentSession.novaOrgPath,
                    gestorState.selectedMonth,
                    gestorState.selectedDate
                );

                if (result.success) {
                    if (gestorState.outputCharacters) {
                        gestorState.outputCharacters = gestorState.outputCharacters.filter(c => c.path !== post.path);
                        renderGestorCharactersList();
                    }
                    if (gestorState.selectedMonth && gestorState.selectedDate) {
                        loadDateCharacters();
                        renderGestorDates(gestorState.selectedMonth);
                    }
                } else {
                    alert("Error moviendo carpeta: " + result.error);
                    btnMove.textContent = `Mover a ${gestorState.selectedDate}`;
                    btnMove.disabled = false;
                }
            };
        }
        
        container.appendChild(card);
    });
}

function updateCharacterMoveButtons() {
    const container = document.getElementById('gestor-characters-list');
    const cards = container.querySelectorAll('.post-card');
    
    cards.forEach((card, index) => {
        const post = (gestorState.visibleCharacters || gestorState.outputCharacters)[index];
        if (!post) return;
        
        const btnMove = card.querySelector('.btn-move');
        if (!btnMove) return;
        
        if (!gestorState.selectedDate) {
            btnMove.disabled = true;
            btnMove.textContent = "Fecha no seleccionada";
            btnMove.onclick = null;
        } else {
            btnMove.disabled = false;
            btnMove.textContent = `Mover a ${gestorState.selectedDate}`;
            btnMove.onclick = async () => {
                if (!gestorState.selectedMonth || !gestorState.selectedDate) return;
                
                btnMove.textContent = "Moviendo...";
                btnMove.disabled = true;

                const result = await window.electronAPI.moveCharacterFolder(
                    post.path,
                    currentSession.baseOrgPath,
                    currentSession.novaOrgPath,
                    gestorState.selectedMonth,
                    gestorState.selectedDate
                );

                if (result.success) {
                    if (gestorState.outputCharacters) {
                        gestorState.outputCharacters = gestorState.outputCharacters.filter(c => c.path !== post.path);
                        renderGestorCharactersList();
                    }
                    if (gestorState.selectedMonth && gestorState.selectedDate) {
                        loadDateCharacters();
                        renderGestorDates(gestorState.selectedMonth);
                    }
                } else {
                    alert("Error moviendo carpeta: " + result.error);
                    btnMove.textContent = `Mover a ${gestorState.selectedDate}`;
                    btnMove.disabled = false;
                }
            };
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Path Selectors
    const btnSelectBaseOrg = document.getElementById('btn-select-base-org');
    const inputBaseOrg = document.getElementById('base-org-path');
    
    // Defer input loading to next tick after currentSession is loaded
    setTimeout(() => {
        if (currentSession.baseOrgPath) inputBaseOrg.value = currentSession.baseOrgPath;
    }, 100);
    
    btnSelectBaseOrg.addEventListener('click', async () => {
        const folder = await window.electronAPI.selectFolder();
        if (folder) {
            currentSession.baseOrgPath = folder;
            inputBaseOrg.value = folder;
            await saveSession();
            await loadGestorData();
        }
    });

    const btnSelectOutput = document.getElementById('btn-select-output');
    const inputOutput = document.getElementById('output-path');
    setTimeout(() => {
        if (currentSession.outputPath) inputOutput.value = currentSession.outputPath;
    }, 100);
    
    btnSelectOutput.addEventListener('click', async () => {
        const folder = await window.electronAPI.selectFolder();
        if (folder) {
            currentSession.outputPath = folder;
            inputOutput.value = folder;
            await saveSession();
            await loadGestorCharacters();
        }
    });

    const btnSelectNovaOrg = document.getElementById('btn-select-nova-org');
    const inputNovaOrg = document.getElementById('nova-org-path');
    setTimeout(() => {
        if (currentSession.novaOrgPath) inputNovaOrg.value = currentSession.novaOrgPath;
    }, 100);
    
    btnSelectNovaOrg.addEventListener('click', async () => {
        const folder = await window.electronAPI.selectFolder();
        if (folder) {
            currentSession.novaOrgPath = folder;
            inputNovaOrg.value = folder;
            await saveSession();
        }
    });

    const btnSelectRulex = document.getElementById('btn-select-rulex');
    const inputRulex = document.getElementById('rulex-path');
    setTimeout(() => {
        if (currentSession.rulexPath) inputRulex.value = currentSession.rulexPath;
    }, 100);
    
    btnSelectRulex.addEventListener('click', async () => {
        const folder = await window.electronAPI.selectFolder();
        if (folder) {
            currentSession.rulexPath = folder;
            inputRulex.value = folder;
            await saveSession();
        }
    });

    const btnSelectYaSubido = document.getElementById('btn-select-yasubido');
    const inputYaSubido = document.getElementById('yasubido-path');
    setTimeout(() => {
        if (currentSession.yaSubidoPath) inputYaSubido.value = currentSession.yaSubidoPath;
    }, 100);
    
    btnSelectYaSubido.addEventListener('click', async () => {
        const folder = await window.electronAPI.selectFolder();
        if (folder) {
            currentSession.yaSubidoPath = folder;
            inputYaSubido.value = folder;
            await saveSession();
        }
    });

    // Rutas Modal Actions
    const modalRutas = document.getElementById('rutas-modal');
    const btnOpenRutas = document.getElementById('btn-open-rutas');
    if (btnOpenRutas) {
        btnOpenRutas.addEventListener('click', () => {
            modalRutas.style.display = 'flex';
            modalRutas.classList.remove('hidden');
        });
    }
    const btnCloseRutas = document.getElementById('btn-close-rutas');
    if (btnCloseRutas) {
        btnCloseRutas.addEventListener('click', () => {
            modalRutas.style.display = 'none';
            modalRutas.classList.add('hidden');
        });
    }

    // Context Menu Actions
    document.getElementById('ctx-abrir').addEventListener('click', async () => {
        if (!contextMenuTarget || !currentSession.baseOrgPath) return;
        const targetPath = `${currentSession.baseOrgPath}\\${contextMenuTarget.month}\\${contextMenuTarget.date}`;
        await window.electronAPI.openInExplorer(targetPath);
        document.getElementById('date-context-menu').style.display = 'none';
    });

    document.getElementById('ctx-renombrar').addEventListener('click', async () => {
        if (!contextMenuTarget || !currentSession.baseOrgPath) return;
        const newName = prompt(`Renombrar fecha ${contextMenuTarget.date} a:`, contextMenuTarget.date);
        if (newName && newName !== contextMenuTarget.date) {
            const basePath = `${currentSession.baseOrgPath}\\${contextMenuTarget.month}\\${contextMenuTarget.date}`;
            await window.electronAPI.renameFolder(basePath, newName);
            if (currentSession.novaOrgPath) {
                const novaPath = `${currentSession.novaOrgPath}\\${contextMenuTarget.month}\\${contextMenuTarget.date}`;
                await window.electronAPI.renameFolder(novaPath, newName);
            }
            if (gestorState.selectedDate === contextMenuTarget.date) {
                gestorState.selectedDate = newName;
                updateCharacterMoveButtons();
            }
            await loadGestorData();
        }
        document.getElementById('date-context-menu').style.display = 'none';
    });

    document.getElementById('ctx-enviar-rulex').addEventListener('click', async () => {
        if (!contextMenuTarget || !currentSession.baseOrgPath) return;
        if (!currentSession.rulexPath) {
            alert('Por favor configura la "Carpeta Rule y X" en los ajustes de Rutas (⚙️).');
            return;
        }
        
        const dateName = contextMenuTarget.date;
        const monthName = contextMenuTarget.month;
        const basePath = `${currentSession.baseOrgPath}\\${monthName}\\${dateName}`;
        
        const parts = dateName.split('-');
        let targetMonthName = "desconocido";
        if (parts.length >= 2) {
            const m = parseInt(parts[1], 10);
            const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            if (m >= 1 && m <= 12) {
                targetMonthName = meses[m - 1];
            }
        }
        
        const confirmSend = confirm(`¿Enviar la carpeta ${dateName} a Rule y X (${targetMonthName})?`);
        if (confirmSend) {
            const result = await window.electronAPI.sendToRuleX(basePath, currentSession.rulexPath, targetMonthName, dateName);
            if (result.success) {
                alert('Carpeta enviada exitosamente.');
                if (gestorState.selectedDate === dateName) {
                    gestorState.selectedDate = null;
                    updateCharacterMoveButtons();
                }
                await loadGestorData();
            } else {
                alert('Error al enviar: ' + result.error);
            }
        }
        document.getElementById('date-context-menu').style.display = 'none';
    });

    document.getElementById('ctx-enviar-yasubido').addEventListener('click', async () => {
        if (!contextMenuTarget || !currentSession.baseOrgPath) return;
        if (!currentSession.yaSubidoPath) {
            alert('Por favor configura la "Carpeta Ya subido" en los ajustes de Rutas (⚙️).');
            return;
        }
        
        const dateName = contextMenuTarget.date;
        const monthName = contextMenuTarget.month;
        const basePath = `${currentSession.baseOrgPath}\\${monthName}\\${dateName}`;
        
        const parts = dateName.split('-');
        let targetMonthName = "desconocido";
        if (parts.length >= 2) {
            const m = parseInt(parts[1], 10);
            const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            if (m >= 1 && m <= 12) {
                targetMonthName = meses[m - 1];
            }
        }
        
        const confirmSend = confirm(`¿Enviar la carpeta ${dateName} a Ya subido (${targetMonthName})?`);
        if (confirmSend) {
            const result = await window.electronAPI.sendToYaSubido(basePath, currentSession.yaSubidoPath, targetMonthName, dateName);
            if (result.success) {
                alert('Carpeta enviada exitosamente a Ya subido.');
                if (gestorState.selectedDate === dateName) {
                    gestorState.selectedDate = null;
                    updateCharacterMoveButtons();
                }
                await loadGestorData();
            } else {
                alert('Error al enviar: ' + result.error);
            }
        }
        document.getElementById('date-context-menu').style.display = 'none';
    });

    document.getElementById('ctx-eliminar').addEventListener('click', async () => {
        if (!contextMenuTarget || !currentSession.baseOrgPath) return;
        const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar la fecha ${contextMenuTarget.date}?`);
        if (confirmDelete) {
            const basePath = `${currentSession.baseOrgPath}\\${contextMenuTarget.month}\\${contextMenuTarget.date}`;
            await window.electronAPI.deleteFolder(basePath);
            if (currentSession.novaOrgPath) {
                const novaPath = `${currentSession.novaOrgPath}\\${contextMenuTarget.month}\\${contextMenuTarget.date}`;
                await window.electronAPI.deleteFolder(novaPath);
            }
            if (gestorState.selectedDate === contextMenuTarget.date) {
                gestorState.selectedDate = null;
                updateCharacterMoveButtons();
            }
            await loadGestorData();
        }
        document.getElementById('date-context-menu').style.display = 'none';
    });

    // Character / Output Context Menu Actions
    const btnCharAbrir = document.getElementById('char-ctx-abrir');
    if (btnCharAbrir) {
        btnCharAbrir.addEventListener('click', async () => {
            if (!charContextMenuTarget || !charContextMenuTarget.path) return;
            const res = await window.electronAPI.openInExplorer(charContextMenuTarget.path);
            if (res && res.success === false && res.error) {
                alert("No se pudo abrir la carpeta en el explorador: " + res.error);
            }
            hideCharContextMenu();
        });
    }

    const btnCharAbrirNova = document.getElementById('char-ctx-abrir-nova');
    if (btnCharAbrirNova) {
        btnCharAbrirNova.addEventListener('click', async () => {
            if (!charContextMenuTarget || !charContextMenuTarget.novaPath) return;
            const res = await window.electronAPI.openInExplorer(charContextMenuTarget.novaPath);
            if (res && res.success === false && res.error) {
                alert("No se pudo abrir la carpeta Nova: " + res.error);
            }
            hideCharContextMenu();
        });
    }

    const btnCharVerFotos = document.getElementById('char-ctx-ver-fotos');
    if (btnCharVerFotos) {
        btnCharVerFotos.addEventListener('click', () => {
            if (!charContextMenuTarget || !charContextMenuTarget.path) return;
            openImageViewer(charContextMenuTarget.path, charContextMenuTarget.folderName);
            hideCharContextMenu();
        });
    }

    const btnCharRenombrar = document.getElementById('char-ctx-renombrar');
    if (btnCharRenombrar) {
        btnCharRenombrar.addEventListener('click', async () => {
            if (!charContextMenuTarget || !charContextMenuTarget.path) return;
            const target = charContextMenuTarget;
            hideCharContextMenu();
            const nameContainer = target.card ? target.card.querySelector('.char-name-container') : null;
            if (nameContainer) {
                handleRenameCharacter(nameContainer, target.path, target.folderName, false);
            } else {
                const currentClean = getCleanCharacterName(target.folderName);
                const newName = prompt(`Renombrar personaje ${currentClean} a:`, currentClean);
                if (newName && newName !== currentClean) {
                    const oldName = target.folderName;
                    const regex = new RegExp(currentClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                    const finalNewName = oldName.replace(regex, newName);
                    const res = await window.electronAPI.renameFolder(target.path, finalNewName);
                    if (res && res.success) {
                        if (gestorState.outputCharacters) await loadGestorCharacters();
                        if (gestorState.selectedMonth && gestorState.selectedDate) await loadDateCharacters();
                    } else {
                        alert("Error al renombrar: " + (res?.error || "Desconocido"));
                    }
                }
            }
        });
    }

    // Gestor UI Actions
    document.getElementById('btn-refresh-gestor').addEventListener('click', async () => {
        await loadGestorData();
        await loadGestorCharacters();
        await loadDateCharacters();
    });

    const monthSelect = document.getElementById('gestor-month-select');
    monthSelect.addEventListener('change', (e) => {
        gestorState.selectedDate = null;
        renderGestorDates(e.target.value);
        updateCharacterMoveButtons(); 
        loadDateCharacters();
    });

    // Move modal logic
    const moveMonthSelect = document.getElementById('move-char-month-select');
    moveMonthSelect.addEventListener('change', (e) => {
        updateMoveCharDateSelect(e.target.value);
    });

    document.getElementById('btn-close-move-char').addEventListener('click', () => {
        const modal = document.getElementById('move-character-modal');
        modal.style.display = 'none';
        modal.classList.add('hidden');
    });

    document.getElementById('btn-confirm-move-char').addEventListener('click', async () => {
        const targetMonth = document.getElementById('move-char-month-select').value;
        const targetDate = document.getElementById('move-char-date-select').value;
        
        if (!targetMonth || !targetDate) {
            alert('Selecciona un mes y fecha de destino válidos.');
            return;
        }

        const btn = document.getElementById('btn-confirm-move-char');
        btn.textContent = 'Moviendo...';
        btn.disabled = true;

        const result = await window.electronAPI.moveOrganizedCharacter(
            moveCharState.charName,
            moveCharState.sourceMonth,
            moveCharState.sourceDate,
            targetMonth,
            targetDate,
            currentSession.baseOrgPath,
            currentSession.novaOrgPath
        );

        if (result.success) {
            document.getElementById('move-character-modal').style.display = 'none';
            document.getElementById('move-character-modal').classList.add('hidden');
            await loadGestorData(); // Reload everything to reflect changes
            await loadDateCharacters();
        } else {
            alert("Error moviendo personaje: " + result.error);
        }
        
        btn.textContent = 'Mover';
        btn.disabled = false;
    });

    document.getElementById('btn-create-month').addEventListener('click', async () => {
        const name = document.getElementById('new-month-name').value.trim();
        if (!name || !currentSession.baseOrgPath) return;
        
        await window.electronAPI.createMonthFolder(currentSession.baseOrgPath, name); 
        await loadGestorData();
        monthSelect.value = name;
        gestorState.selectedMonth = name;
        document.getElementById('new-month-name').value = '';
        renderGestorDates(name);
    });

    document.getElementById('btn-create-date').addEventListener('click', async () => {
        const dateName = document.getElementById('new-date-name').value.trim();
        if (!dateName || !gestorState.selectedMonth || !currentSession.baseOrgPath) return;
        
        await window.electronAPI.createDateFolder(currentSession.baseOrgPath, gestorState.selectedMonth, dateName);
        if (currentSession.novaOrgPath) {
            await window.electronAPI.createDateFolder(currentSession.novaOrgPath, gestorState.selectedMonth, dateName);
        }

        document.getElementById('new-date-name').value = '';
        await loadGestorData();
    });

    document.getElementById('btn-auto-dates').addEventListener('click', async () => {
        const monthValue = document.getElementById('auto-month-picker').value;
        if (!monthValue || !gestorState.selectedMonth || !currentSession.baseOrgPath) {
            alert("Por favor selecciona un mes en el selector antes de generar.");
            return;
        }
        
        const [yearStr, monthStr] = monthValue.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        
        const daysInMonth = new Date(year, month, 0).getDate();
        
        const btn = document.getElementById('btn-auto-dates');
        btn.textContent = "Generando...";
        btn.disabled = true;

        for (let day = 1; day <= daysInMonth; day++) {
            const newDd = String(day).padStart(2, '0');
            const newMm = String(month).padStart(2, '0');
            const newYy = String(year).slice(-2);
            
            const newDateName = `${newDd}-${newMm}-${newYy}`;
            await window.electronAPI.createDateFolder(currentSession.baseOrgPath, gestorState.selectedMonth, newDateName);
            if (currentSession.novaOrgPath) {
                await window.electronAPI.createDateFolder(currentSession.novaOrgPath, gestorState.selectedMonth, newDateName);
            }
        }
        
        btn.textContent = "Generar Mes Completo";
        btn.disabled = false;
        document.getElementById('auto-month-picker').value = '';
        await loadGestorData();
    });

    const gestorTabBtn = document.querySelector('.tab-btn[data-tab="gestor"]');
    if (gestorTabBtn) {
        gestorTabBtn.addEventListener('click', () => {
            loadGestorData();
            loadGestorCharacters();
        });
    }

    const btnOpenDateFolder = document.getElementById('btn-open-date-folder');
    if (btnOpenDateFolder) {
        btnOpenDateFolder.addEventListener('click', async () => {
            if (!currentSession.baseOrgPath || !gestorState.selectedMonth || !gestorState.selectedDate) {
                alert("Primero selecciona un mes y una fecha.");
                return;
            }
            const targetPath = `${currentSession.baseOrgPath}\\${gestorState.selectedMonth}\\${gestorState.selectedDate}`;
            await window.electronAPI.openInExplorer(targetPath);
        });
    }

    const btnOpenOutputFolder = document.getElementById('btn-open-output-folder');
    if (btnOpenOutputFolder) {
        btnOpenOutputFolder.addEventListener('click', async () => {
            if (!currentSession.outputPath) {
                alert("Primero configura la carpeta Output en Ajustes.");
                return;
            }
            await window.electronAPI.openInExplorer(currentSession.outputPath);
        });
    }

    const outputContainer = document.getElementById('gestor-characters-list');
    if (outputContainer) {
        outputContainer.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.post-card')) return;
            if (currentSession.outputPath) {
                e.preventDefault();
                showCharacterContextMenu(e.clientX, e.clientY, {
                    path: currentSession.outputPath,
                    folderName: 'Carpeta Output',
                    isRootOutput: true
                }, null);
            }
        });
    }

    const dateContentsContainer = document.getElementById('gestor-date-contents-list');
    if (dateContentsContainer) {
        dateContentsContainer.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.post-card')) return;
            if (currentSession.baseOrgPath && gestorState.selectedMonth && gestorState.selectedDate) {
                e.preventDefault();
                const targetPath = `${currentSession.baseOrgPath}\\${gestorState.selectedMonth}\\${gestorState.selectedDate}`;
                showCharacterContextMenu(e.clientX, e.clientY, {
                    path: targetPath,
                    folderName: `${gestorState.selectedMonth}/${gestorState.selectedDate}`,
                    isRootOutput: true
                }, null);
            }
        });
    }

    const outputSortSelect = document.getElementById('gestor-output-sort');
    if (outputSortSelect) {
        outputSortSelect.addEventListener('change', () => {
            renderGestorCharactersList();
            updateCharacterMoveButtons();
        });
    }

    // Global Search Logic
    const searchInput = document.getElementById('gestor-global-search');
    const searchResults = document.getElementById('gestor-search-results');
    let searchTimeout = null;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (searchTimeout) clearTimeout(searchTimeout);
            
            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            searchTimeout = setTimeout(async () => {
                searchResults.style.display = 'block';
                searchResults.innerHTML = '<div style="padding: 1rem; color: #94a3b8; text-align: center;">Buscando...</div>';

                const response = await window.electronAPI.searchCharacters(
                    query,
                    currentSession.baseOrgPath,
                    currentSession.outputPath
                );

                if (!response.success || response.results.length === 0) {
                    searchResults.innerHTML = '<div style="padding: 1rem; color: #94a3b8; text-align: center;">No se encontraron resultados.</div>';
                    return;
                }

                searchResults.innerHTML = '';
                response.results.forEach(res => {
                    const item = document.createElement('div');
                    item.style.cssText = "padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s; display: flex; justify-content: space-between; align-items: center;";
                    item.title = "Clic derecho: abrir en explorador / opciones";
                    item.onmouseover = () => item.style.background = 'rgba(255,255,255,0.05)';
                    item.onmouseout = () => item.style.background = 'transparent';
                    item.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showCharacterContextMenu(e.clientX, e.clientY, res, null);
                    });
                    
                    const badgeColor = res.type === 'output' ? '#f59e0b' : '#3b82f6';
                    const badgeText = res.type === 'output' ? 'Output' : res.locationText;
                    
                    item.innerHTML = `
                        <div style="font-weight: 500; color: #fff;">${res.folderName}</div>
                        <div style="font-size: 0.75rem; padding: 0.2rem 0.5rem; background: ${badgeColor}20; color: ${badgeColor}; border: 1px solid ${badgeColor}50; border-radius: 4px;">
                            ${badgeText}
                        </div>
                    `;

                    item.addEventListener('click', async () => {
                        searchResults.style.display = 'none';
                        searchInput.value = '';
                        
                        if (res.type === 'output') {
                            document.getElementById('gestor-characters-list').scrollIntoView({ behavior: 'smooth' });
                        } else if (res.type === 'organized') {
                            const monthSelect = document.getElementById('gestor-month-select');
                            monthSelect.value = res.month;
                            gestorState.selectedMonth = res.month;
                            renderGestorDates(res.month);
                            
                            // Highlight and select the date
                            setTimeout(async () => {
                                const datesList = document.getElementById('gestor-dates-list');
                                const dateBtns = datesList.querySelectorAll('.btn-date');
                                dateBtns.forEach(btn => {
                                    if (btn.textContent.trim() === res.date) {
                                        btn.click();
                                        setTimeout(() => {
                                            document.getElementById('gestor-date-contents-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }, 100);
                                    }
                                });
                            }, 100);
                        }
                    });

                    searchResults.appendChild(item);
                });
            }, 300);
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }
});

// ==========================================
// IMAGE VIEWER QC LOGIC
// ==========================================
let viewerState = {
    folderPath: null,
    images: [],
    selectedImagePath: null,
    deletedHistory: [],
    currentPage: 0,
    pageSize: 4,
    novaPath: null,
    nickyPath: null
};

async function openImageViewer(folderPath, folderName, originalNickyPath = null) {
    viewerState.folderPath = folderPath;
    viewerState.selectedImagePath = null;
    viewerState.deletedHistory = [];
    const titleEl = document.getElementById('image-viewer-title');
    titleEl.textContent = `QC: ${folderName}`;
    titleEl.style.cursor = 'pointer';
    titleEl.title = "Doble clic para renombrar";
    titleEl.ondblclick = (e) => {
        e.stopPropagation();
        handleRenameCharacter(titleEl, viewerState.folderPath, folderName, true);
    };
    
    // Aplicar la preferencia de tamaño de cuadrícula
    const savedSize = currentSession.qcGridSize || '4';
    viewerState.pageSize = parseInt(savedSize, 10);
    viewerState.currentPage = 0;
    
    const grid = document.getElementById('image-viewer-grid');
    grid.className = `viewer-grid grid-cols-${savedSize}`;
    
    document.querySelectorAll('.btn-grid-size').forEach(b => {
        if (b.dataset.size === savedSize) {
            b.classList.add('active');
            b.style.background = 'rgba(59, 130, 246, 0.2)';
            b.style.color = '#60a5fa';
        } else {
            b.classList.remove('active');
            b.style.background = 'transparent';
            b.style.color = '#94a3b8';
        }
    });
    
    const btnNova = document.getElementById('btn-viewer-nova');
    btnNova.style.display = 'none';
    viewerState.novaPath = null;
    viewerState.nickyPath = originalNickyPath || folderPath;
    
    if (originalNickyPath) {
        // Estamos viendo Nova, permitir volver a Nicky
        btnNova.style.display = 'block';
        btnNova.textContent = 'Modo Nicky';
        btnNova.onclick = () => {
            const cleanName = folderName.replace(' [Nova]', '');
            openImageViewer(originalNickyPath, cleanName);
        };
    } else if (!folderName.includes('[Nova]')) {
        // Estamos viendo Nicky, buscar si hay Nova
        const novaPath = await window.electronAPI.getNovaFolderPath(folderPath, currentSession.baseOrgPath, currentSession.novaOrgPath);
        if (novaPath) {
            viewerState.novaPath = novaPath;
            btnNova.style.display = 'block';
            btnNova.textContent = 'Modo Nova';
            btnNova.onclick = () => {
                openImageViewer(novaPath, folderName + " [Nova]", folderPath);
            };
        }
    }
    const btnQcViewer = document.getElementById('btn-viewer-qc');
    if (btnQcViewer) {
        let isQcDone = currentSession.qcDone && currentSession.qcDone[folderName];
        if (isQcDone) {
            btnQcViewer.innerHTML = '✅ QC OK';
            btnQcViewer.style.background = 'rgba(34, 197, 94, 0.2)';
            btnQcViewer.style.color = '#4ade80';
            btnQcViewer.style.borderColor = '#4ade80';
        } else {
            btnQcViewer.innerHTML = '❌ Sin QC';
            btnQcViewer.style.background = 'rgba(255,255,255,0.1)';
            btnQcViewer.style.color = '#fff';
            btnQcViewer.style.borderColor = 'rgba(255,255,255,0.2)';
        }

        btnQcViewer.onclick = async () => {
            if (!currentSession.qcDone) currentSession.qcDone = {};
            let currentQc = currentSession.qcDone[folderName];
            
            if (currentQc) {
                currentSession.qcDone[folderName] = false;
                btnQcViewer.innerHTML = '❌ Sin QC';
                btnQcViewer.style.background = 'rgba(255,255,255,0.1)';
                btnQcViewer.style.color = '#fff';
                btnQcViewer.style.borderColor = 'rgba(255,255,255,0.2)';
            } else {
                currentSession.qcDone[folderName] = true;
                btnQcViewer.innerHTML = '✅ QC OK';
                btnQcViewer.style.background = 'rgba(34, 197, 94, 0.2)';
                btnQcViewer.style.color = '#4ade80';
                btnQcViewer.style.borderColor = '#4ade80';
            }
            await saveSession();
            
            // Actualizar botones de QC en la lista de fondo si existen
            const cards = document.querySelectorAll('.post-card');
            cards.forEach(card => {
                const nameEls = card.querySelectorAll('div');
                let found = false;
                nameEls.forEach(el => {
                    if (el.textContent.trim().startsWith(folderName)) found = true;
                });
                if (found) {
                    const btnQc = card.querySelector('.btn-qc');
                    if (btnQc) {
                        const newQc = currentSession.qcDone[folderName];
                        if (!newQc) {
                            btnQc.innerHTML = '❌ Sin QC';
                            btnQc.style.background = 'rgba(255,255,255,0.1)';
                            btnQc.style.color = '#fff';
                            btnQc.style.borderColor = 'rgba(255,255,255,0.2)';
                        } else {
                            btnQc.innerHTML = '✅ QC OK';
                            btnQc.style.background = 'rgba(34, 197, 94, 0.2)';
                            btnQc.style.color = '#4ade80';
                            btnQc.style.borderColor = '#4ade80';
                        }
                    }
                }
            });

            // Actualizar el contador del Gestor si estamos ah y la lista est cargada
            if (gestorState.outputCharacters) {
                renderGestorCharactersList();
            }
        };
    }

    await loadViewerImages();
    
    document.getElementById('image-viewer-modal').style.display = 'flex';
}

function renderDestacadasPopover(images) {
    const popoverGrid = document.getElementById('destacadas-popover-grid');
    const popoverBadge = document.getElementById('destacadas-popover-badge');
    const popoverFooter = document.getElementById('destacadas-popover-footer');
    const footerCount = document.getElementById('destacadas-popover-footer-count');
    if (!popoverGrid) return;
    
    const destacadas = (images || []).filter(img => {
        const dotIndex = img.name.lastIndexOf('.');
        const nameWithoutExt = dotIndex !== -1 ? img.name.substring(0, dotIndex) : img.name;
        return /^[a-z]{1,2}$/i.test(nameWithoutExt);
    }).sort((a, b) => {
        const dotA = a.name.lastIndexOf('.');
        const dotB = b.name.lastIndexOf('.');
        const nameA = (dotA !== -1 ? a.name.substring(0, dotA) : a.name).toLowerCase();
        const nameB = (dotB !== -1 ? b.name.substring(0, dotB) : b.name).toLowerCase();
        if (nameA.length !== nameB.length) return nameA.length - nameB.length;
        return nameA.localeCompare(nameB);
    });
    
    if (popoverBadge) {
        popoverBadge.textContent = destacadas.length;
    }
    
    popoverGrid.innerHTML = '';
    
    if (destacadas.length === 0) {
        popoverGrid.innerHTML = `
            <div class="destacadas-empty-state">
                <span style="font-size: 1.5rem; opacity: 0.6;">⭐</span>
                <span style="color: #cbd5e1; font-size: 0.85rem; font-weight: 500;">Sin imágenes destacadas</span>
                <span style="color: #64748b; font-size: 0.75rem; text-align: center;">Haz clic en "⭐ Destacar" en cualquier imagen para fijarla aquí.</span>
            </div>
        `;
        if (popoverFooter) popoverFooter.style.display = 'none';
        return;
    }
    
    if (popoverFooter) {
        popoverFooter.style.display = 'flex';
        if (footerCount) {
            footerCount.textContent = `${destacadas.length} ${destacadas.length === 1 ? 'imagen' : 'imágenes'}`;
        }
    }
    
    destacadas.forEach(img => {
        const card = document.createElement('div');
        card.className = 'destacada-thumb-card';
        card.title = `${img.name} (Clic para ir a esta imagen en el visor)`;
        
        card.innerHTML = `
            <div class="destacada-thumb-img-wrapper">
                <img src="file://${img.path.replace(/\\/g, '/')}" alt="${img.name}" loading="lazy">
            </div>
            <div class="destacada-thumb-label">${img.name}</div>
        `;
        
        card.onclick = async (e) => {
            e.stopPropagation();
            const targetIndex = viewerState.images.findIndex(i => i.path === img.path || i.name.toLowerCase() === img.name.toLowerCase());
            if (targetIndex !== -1) {
                const targetPage = Math.floor(targetIndex / viewerState.pageSize);
                viewerState.currentPage = targetPage;
                viewerState.selectedImagePath = img.path;
                await loadViewerImages();
                const sel = document.querySelector('.viewer-image-card.selected');
                if (sel) sel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        };
        
        popoverGrid.appendChild(card);
    });
}

async function loadViewerImages() {
    const grid = document.getElementById('image-viewer-grid');
    grid.innerHTML = '<div style="color: white; grid-column: 1/-1; text-align: center;">Cargando imágenes...</div>';
    
    const images = await window.electronAPI.getFolderImages(viewerState.folderPath);
    viewerState.images = images;
    
    // Contar destacadas
    const destacadasCount = images.filter(img => {
        const dotIndex = img.name.lastIndexOf('.');
        const nameWithoutExt = dotIndex !== -1 ? img.name.substring(0, dotIndex) : img.name;
        return /^[a-z]{1,2}$/i.test(nameWithoutExt);
    }).length;
    
    const destacadasEl = document.getElementById('destacadas-count');
    if (destacadasEl) {
        destacadasEl.textContent = destacadasCount;
    }
    
    renderDestacadasPopover(images);
    
    grid.innerHTML = '';
    
    if (images.length === 0) {
        grid.innerHTML = '<div style="color: #94a3b8; grid-column: 1/-1; text-align: center;">No se encontraron imágenes.</div>';
        document.getElementById('page-indicator').textContent = '0 de 0';
        return;
    }
    
    // Paginación
    const totalPages = Math.ceil(images.length / viewerState.pageSize);
    if (viewerState.currentPage >= totalPages) {
        viewerState.currentPage = Math.max(0, totalPages - 1);
    }
    
    const startIdx = viewerState.currentPage * viewerState.pageSize;
    const endIdx = Math.min(startIdx + viewerState.pageSize, images.length);
    document.getElementById('page-indicator').textContent = `Imágenes ${startIdx + 1}-${endIdx} de ${images.length}`;
    
    const pageImages = images.slice(startIdx, endIdx);
    
    pageImages.forEach(img => {
        const card = document.createElement('div');
        card.className = 'viewer-image-card';
        if (viewerState.selectedImagePath === img.path) {
            card.classList.add('selected');
        }
        
        card.innerHTML = `
            <img src="file://${img.path.replace(/\\/g, '/')}" alt="${img.name}" title="${img.name}">
            <div class="viewer-image-name" title="Doble clic para renombrar">${img.name}</div>
            <button class="btn btn-destacar" style="margin-top: 5px; width: 100%; background: rgba(234, 179, 8, 0.2); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.4); padding: 0.2rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;">⭐ Destacar</button>
            <button class="btn btn-eliminar" style="margin-top: 5px; width: 100%; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); padding: 0.2rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;">🗑️ Eliminar</button>
        `;
        
        const imgEl = card.querySelector('img');
        const nameEl = card.querySelector('.viewer-image-name');
        
        // Selección
        imgEl.onclick = () => {
            document.querySelectorAll('.viewer-image-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            viewerState.selectedImagePath = img.path;
        };
        
        // Renombrado (Doble Clic)
        nameEl.ondblclick = (e) => {
            if (e.target.tagName === 'INPUT') return; // Evitar recrear si ya hay un input
            
            const currentName = img.name;
            let isSubmitting = false;
            
            nameEl.innerHTML = `<input type="text" class="viewer-image-name-input" value="${currentName}">`;
            const input = nameEl.querySelector('input');
            input.focus();
            
            // Seleccionar solo el nombre sin la extensión
            const dotIndex = currentName.lastIndexOf('.');
            if (dotIndex > 0) {
                input.setSelectionRange(0, dotIndex);
            }
            
            input.ondblclick = (e) => e.stopPropagation(); // Evitar que el doble clic pase al contenedor
            
            input.onblur = () => {
                if (isSubmitting) return; // No hacer nada si estamos esperando resultado
                // Restaurar si pierde el foco
                nameEl.textContent = currentName;
            };
            
            input.onkeydown = async (e) => {
                if (e.key === 'Escape') {
                    nameEl.textContent = currentName;
                } else if (e.key === 'Enter') {
                    e.preventDefault(); // Evitar comportamientos por defecto del Enter
                    const newName = input.value.trim();
                    if (newName && newName !== currentName) {
                        isSubmitting = true;
                        input.disabled = true; // Deshabilitar para evitar múltiples envíos y pérdida de foco normal
                        
                        const result = await window.electronAPI.renameFile(img.path, newName);
                        if (result.success) {
                            await loadViewerImages(); // recargar
                        } else {
                            nameEl.textContent = currentName;
                            // Usar setTimeout para evitar el bug de foco de alert en Electron y permitir que el input se destruya antes del alert
                            setTimeout(() => alert("Error al renombrar: " + result.error), 10);
                        }
                    } else {
                        nameEl.textContent = currentName;
                    }
                }
            };
        };
        
        const btnDestacar = card.querySelector('.btn-destacar');
        btnDestacar.onmouseover = () => btnDestacar.style.background = 'rgba(234, 179, 8, 0.3)';
        btnDestacar.onmouseout = () => btnDestacar.style.background = 'rgba(234, 179, 8, 0.2)';
        
        btnDestacar.onclick = async (e) => {
            e.stopPropagation();
            
            const dotIndex = img.name.lastIndexOf('.');
            const ext = dotIndex !== -1 ? img.name.substring(dotIndex) : '';
            const alphabet = 'abcdefghijklmnopqrstuvwxyz';
            let newName = null;
            
            const currentNames = viewerState.images.map(i => i.name.toLowerCase());
            
            for (let i = 0; i < alphabet.length; i++) {
                const testName = alphabet[i] + ext.toLowerCase();
                if (!currentNames.includes(testName)) {
                    newName = alphabet[i] + ext;
                    break;
                }
            }
            
            if (!newName) {
                let index = 26;
                while (!newName && index < 1000) {
                    const char1 = alphabet[Math.floor(index / 26) - 1];
                    const char2 = alphabet[index % 26];
                    const testName = char1 + char2 + ext.toLowerCase();
                    if (!currentNames.includes(testName)) {
                        newName = char1 + char2 + ext;
                    }
                    index++;
                }
            }
            
            if (newName && newName !== img.name) {
                btnDestacar.disabled = true;
                btnDestacar.textContent = 'Destacando...';
                const result = await window.electronAPI.renameFile(img.path, newName);
                if (result.success) {
                    await loadViewerImages();
                } else {
                    setTimeout(() => alert("Error al destacar: " + result.error), 10);
                    btnDestacar.disabled = false;
                    btnDestacar.textContent = '⭐ Destacar';
                }
            }
        };

        const btnEliminar = card.querySelector('.btn-eliminar');
        btnEliminar.onmouseover = () => btnEliminar.style.background = 'rgba(239, 68, 68, 0.3)';
        btnEliminar.onmouseout = () => btnEliminar.style.background = 'rgba(239, 68, 68, 0.2)';
        
        btnEliminar.onclick = async (e) => {
            e.stopPropagation();
            
            btnEliminar.disabled = true;
            btnEliminar.textContent = 'Eliminando...';
            
            const pathToDelete = img.path;
            const result = await window.electronAPI.deleteFileTrash(pathToDelete);
            
            if (result.success && viewerState.nickyPath && viewerState.folderPath !== viewerState.nickyPath) {
                const fileName = window.electronAPI.pathBasename ? await window.electronAPI.pathBasename(pathToDelete) : pathToDelete.split('\\').pop().split('/').pop();
                const nickyImgPath = viewerState.nickyPath + '\\' + fileName;
                await window.electronAPI.deleteFileTrash(nickyImgPath);
            }

            if (result.success) {
                if (viewerState.selectedImagePath === pathToDelete) {
                    viewerState.selectedImagePath = null;
                }
                await loadViewerImages();
            } else {
                setTimeout(() => alert("Error al borrar: " + result.error), 10);
                btnEliminar.disabled = false;
                btnEliminar.textContent = '🗑️ Eliminar';
            }
        };
        
        grid.appendChild(card);
    });
}

// Eventos globales para el visor
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('image-viewer-modal');
    
    // Cerrar visor
    document.getElementById('btn-close-viewer').onclick = () => {
        modal.style.display = 'none';
        viewerState.folderPath = null;
        // Se elimina la recarga de carpetas para mejorar el rendimiento
    };
    
    // Paginación
    document.getElementById('btn-prev-page').onclick = () => {
        if (viewerState.currentPage > 0) {
            viewerState.currentPage--;
            loadViewerImages();
        }
    };
    
    document.getElementById('btn-next-page').onclick = () => {
        const totalPages = Math.ceil(viewerState.images.length / viewerState.pageSize);
        if (viewerState.currentPage < totalPages - 1) {
            viewerState.currentPage++;
            loadViewerImages();
        }
    };

    // Controles de tamaño de cuadrícula
    document.querySelectorAll('.btn-grid-size').forEach(btn => {
        btn.onclick = async () => {
            document.querySelectorAll('.btn-grid-size').forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = '#94a3b8';
            });
            btn.classList.add('active');
            btn.style.background = 'rgba(59, 130, 246, 0.2)';
            btn.style.color = '#60a5fa';
            
            const size = btn.dataset.size;
            viewerState.pageSize = parseInt(size, 10);
            viewerState.currentPage = 0; // Reiniciar a la primera página al cambiar vista
            const grid = document.getElementById('image-viewer-grid');
            grid.className = `viewer-grid grid-cols-${size}`;
            
            // Guardar preferencia
            currentSession.qcGridSize = size;
            await saveSession();
            
            // Recargar imágenes para aplicar nueva paginación
            await loadViewerImages();
        };
    });
    
    // Atajos de teclado en el visor
    document.addEventListener('keydown', async (e) => {
        const modalEl = document.getElementById('image-viewer-modal');
        if (!modalEl || modalEl.style.display === 'none') return;
        
        // Ignorar si el usuario está escribiendo en un input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        // Cerrar con Escape
        if (e.key === 'Escape') {
            document.getElementById('btn-close-viewer').click();
            return;
        }
        
        // Borrar con Suprimir (Delete) o Retroceso (Backspace)
        if ((e.key === 'Delete' || e.key === 'Backspace') && viewerState.selectedImagePath) {
            const pathToDelete = viewerState.selectedImagePath;
            const result = await window.electronAPI.deleteFileTrash(pathToDelete);
            
            // Si estamos en modo Nova, borrar la homóloga en Nicky
            if (result.success && viewerState.nickyPath && viewerState.folderPath !== viewerState.nickyPath) {
                // Sacar solo el nombre del archivo
                const fileName = window.electronAPI.pathBasename ? await window.electronAPI.pathBasename(pathToDelete) : pathToDelete.split('\\').pop().split('/').pop();
                const nickyImgPath = viewerState.nickyPath + '\\' + fileName;
                await window.electronAPI.deleteFileTrash(nickyImgPath);
            }

            if (result.success) {
                viewerState.selectedImagePath = null;
                await loadViewerImages();
            } else {
                alert("Error al borrar: " + result.error);
            }
        }
        
        // Flechas para paginación
        if (e.key === 'ArrowLeft') {
            document.getElementById('btn-prev-page').click();
        } else if (e.key === 'ArrowRight') {
            document.getElementById('btn-next-page').click();
        }
    });
});

// ==========================================
// BATCH AUTO UPLOAD & MODO SUPER AUTOMÁTICO
// ==========================================
let autoUploadQueue = [];
let isAutoUploading = false;
let isSuperAutoMode = false;
let superAutoStage = 0; // 0=inactivo, 1=subiendo perfil 1, 2=cargando/comprimiendo perfil 2, 3=subiendo perfil 2, 4=finalizando/restaurando
let superAutoOriginalFolder = null;
let superAutoOriginalProfile = null;
let superAutoCounterpartFolder = null;
let superAutoCounterpartProfile = null;

async function cancelAutoUpload() {
    isAutoUploading = false;
    currentCompressionRun = null;
    isCompressingBackground = false;
    autoUploadQueue = [];

    const btnAutoBatch = document.getElementById('btn-auto-batch');

    if (isSuperAutoMode && superAutoStage >= 2) {
        if (btnAutoBatch) {
            btnAutoBatch.innerHTML = '🧹 Cancelando y restaurando original...';
            btnAutoBatch.disabled = true;
        }

        // Si estamos en la contraparte, borrar sus .rar
        if (currentPosts && currentPosts.length > 0) {
            const folderPaths = currentPosts.map(p => p.path);
            await window.electronAPI.deleteRars(folderPaths);
        }

        // Restaurar perfil original
        currentSession.activeProfile = superAutoOriginalProfile;
        updateProfileUI();
        await saveSession();

        // Volver a cargar la carpeta original manteniendo sus .rar intactos
        if (superAutoOriginalFolder) {
            await navigateToFolder(superAutoOriginalFolder, true);
        }
    }

    isSuperAutoMode = false;
    superAutoStage = 0;
    superAutoOriginalFolder = null;
    superAutoOriginalProfile = null;
    superAutoCounterpartFolder = null;
    superAutoCounterpartProfile = null;

    if (btnAutoBatch) {
        btnAutoBatch.disabled = false;
        btnAutoBatch.innerHTML = '🚀 Iniciar Subida Automática (Batch)';
    }
}

async function startSuperAutoStageTwo() {
    superAutoStage = 2;
    const btnAutoBatch = document.getElementById('btn-auto-batch');
    const counterpartName = superAutoCounterpartProfile === 'nova' ? 'Nova (Opera)' : 'Nicky (Brave)';
    
    if (btnAutoBatch) {
        btnAutoBatch.innerHTML = `⏳ Preparando contraparte (${counterpartName})...`;
        btnAutoBatch.disabled = true;
    }

    // 1. Cambiar al perfil contraparte
    currentSession.activeProfile = superAutoCounterpartProfile;
    updateProfileUI();
    await saveSession();

    // 2. Cargar carpeta contraparte manteniendo los .rar de la carpeta previa (original)
    await navigateToFolder(superAutoCounterpartFolder, true);

    if (!isAutoUploading) return; // Si fue cancelado durante navegación

    if (!currentPosts || currentPosts.length === 0) {
        alert(`Modo Super Automático: No se encontraron posts en la carpeta contraparte: ${superAutoCounterpartFolder}`);
        await finishSuperAuto(false);
        return;
    }

    // 3. Comprimir automáticamente todos los .rar de la contraparte
    if (btnAutoBatch) {
        btnAutoBatch.innerHTML = `📦 Comprimiendo .rar (${superAutoCounterpartProfile === 'nova' ? 'Nova' : 'Nicky'})...`;
    }

    const rarStatus = document.getElementById('rar-status');
    if (rarStatus) {
        rarStatus.innerHTML = `🌟 Modo Super Automático: Comprimiendo posts de ${counterpartName}...`;
    }

    isCompressingBackground = true;
    const thisRun = Symbol();
    currentCompressionRun = thisRun;
    updateGlobalRarStatus(currentCardsElements);

    await startBackgroundCompression(currentCardsElements, thisRun);

    if (!isAutoUploading || currentCompressionRun !== thisRun) return; // Si fue cancelado durante compresión

    isCompressingBackground = false;
    updateGlobalRarStatus(currentCardsElements);

    // 4. Filtrar posts listos de la contraparte
    const counterpartPostsReady = currentPosts.filter(p => p.hasRar);
    if (counterpartPostsReady.length === 0) {
        alert(`Modo Super Automático: No se pudieron generar los archivos .rar para la contraparte.`);
        await finishSuperAuto(false);
        return;
    }

    // 5. Iniciar subida de la contraparte (Stage 3)
    superAutoStage = 3;
    autoUploadQueue = [...counterpartPostsReady];
    if (btnAutoBatch) {
        btnAutoBatch.disabled = false;
        btnAutoBatch.innerHTML = `⏹️ Cancelar Subida Batch (Super Auto: ${superAutoCounterpartProfile === 'nova' ? 'Nova' : 'Nicky'})`;
    }

    await processNextAutoUpload();
}

async function finishSuperAuto(success = true) {
    superAutoStage = 4;
    const btnAutoBatch = document.getElementById('btn-auto-batch');
    if (btnAutoBatch) {
        btnAutoBatch.innerHTML = '🧹 Restaurando carpeta original...';
        btnAutoBatch.disabled = true;
    }

    // 1. Borrar los .rar de la contraparte
    if (currentPosts && currentPosts.length > 0) {
        const folderPaths = currentPosts.map(p => p.path);
        await window.electronAPI.deleteRars(folderPaths);
    }

    // 2. Restaurar perfil original
    currentSession.activeProfile = superAutoOriginalProfile;
    updateProfileUI();
    await saveSession();

    // 3. Volver a mostrar la carpeta original manteniendo sus .rar intactos
    if (superAutoOriginalFolder) {
        await navigateToFolder(superAutoOriginalFolder, true);
    }

    // 4. Limpiar estado
    isAutoUploading = false;
    isSuperAutoMode = false;
    superAutoStage = 0;
    autoUploadQueue = [];
    superAutoOriginalFolder = null;
    superAutoOriginalProfile = null;
    superAutoCounterpartFolder = null;
    superAutoCounterpartProfile = null;

    if (btnAutoBatch) {
        btnAutoBatch.disabled = false;
        btnAutoBatch.innerHTML = '🚀 Iniciar Subida Automática (Batch)';
    }

    if (success) {
        alert(
            `🌟 ¡Modo Super Automático Finalizado con Éxito! 🌟\n\n` +
            `• Se completó la subida de ambos perfiles a Patreon.\n` +
            `• Los archivos .rar temporales de la contraparte fueron eliminados.\n` +
            `• Tu carpeta original ha sido recargada con sus .rar intactos.`
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnAutoBatch = document.getElementById('btn-auto-batch');
    if (btnAutoBatch) {
        btnAutoBatch.addEventListener('click', async () => {
            if (isAutoUploading) {
                const cancel = confirm('Ya hay una subida en progreso. ¿Deseas cancelarla?');
                if (cancel) {
                    await cancelAutoUpload();
                }
                return;
            }

            const chkSuperAuto = document.getElementById('chk-super-auto');
            const superAutoActive = chkSuperAuto && chkSuperAuto.checked;

            // Filtrar posts válidos (que tengan rar generado)
            const postsReady = currentPosts.filter(p => p.hasRar);
            if (postsReady.length === 0) {
                return alert('No hay posts listos para subir. Asegúrate de que las carpetas tengan su archivo .rar generado.');
            }

            if (superAutoActive) {
                const originalFolder = currentSession.lastFolder;
                const originalProfile = currentSession.activeProfile || 'nicky';

                const counterpartRes = await window.electronAPI.getCounterpartFolder(originalFolder, originalProfile);
                if (!counterpartRes || !counterpartRes.success) {
                    return alert(`Modo Super Automático: No se pudo resolver la carpeta contraparte.\n\nDetalle: ${counterpartRes ? counterpartRes.error : 'Error desconocido'}\n\nAsegúrate de tener configuradas las carpetas de Nicky y Nova en el Gestor.`);
                }

                const origProfileName = originalProfile === 'nova' ? 'Nova (Opera)' : 'Nicky (Brave)';
                const targetProfileName = counterpartRes.targetProfile === 'nova' ? 'Nova (Opera)' : 'Nicky (Brave)';

                const confirmSuper = confirm(
                    `🌟 MODO SUPER AUTOMÁTICO 🌟\n\n` +
                    `1. Se subirán ${postsReady.length} posts del perfil actual: ${origProfileName}.\n` +
                    `2. Luego se cargará automáticamente la contraparte: ${targetProfileName}.\n` +
                    `3. Se generarán automáticamente los .rar de la contraparte y se subirán a Patreon.\n` +
                    `4. Al finalizar, se eliminarán los .rar de la contraparte y volverá a mostrarse la carpeta original intacta.\n\n` +
                    `¿Deseas iniciar el proceso?`
                );
                if (!confirmSuper) return;

                isSuperAutoMode = true;
                superAutoStage = 1;
                superAutoOriginalFolder = originalFolder;
                superAutoOriginalProfile = originalProfile;
                superAutoCounterpartFolder = counterpartRes.counterpartPath;
                superAutoCounterpartProfile = counterpartRes.targetProfile;

                autoUploadQueue = [...postsReady];
                isAutoUploading = true;
                btnAutoBatch.innerHTML = `⏹️ Cancelar Subida Batch (Super Auto: ${originalProfile === 'nova' ? 'Nova' : 'Nicky'})`;

                await processNextAutoUpload();
            } else {
                isSuperAutoMode = false;
                superAutoStage = 0;

                const confirmBatch = confirm(`¿Iniciar subida automática de ${postsReady.length} posts a Patreon? Las pestañas permanecerán abiertas para revisión final.`);
                if (!confirmBatch) return;

                autoUploadQueue = [...postsReady];
                isAutoUploading = true;
                btnAutoBatch.innerHTML = '⏹️ Cancelar Subida Batch';

                await processNextAutoUpload();
            }
        });
    }
});

async function processNextAutoUpload() {
    if (!isAutoUploading) return;

    if (autoUploadQueue.length === 0) {
        if (isSuperAutoMode && superAutoStage === 1) {
            await startSuperAutoStageTwo();
            return;
        }

        if (isSuperAutoMode && superAutoStage === 3) {
            await finishSuperAuto(true);
            return;
        }

        isAutoUploading = false;
        const btnAutoBatch = document.getElementById('btn-auto-batch');
        if (btnAutoBatch) btnAutoBatch.innerHTML = '🚀 Iniciar Subida Automática (Batch)';
        alert("¡Subida Automática terminada! Revisa las pestañas abiertas y presiona Publicar o Programar en cada una.");
        return;
    }

    const post = autoUploadQueue.shift();
    
    // Abrir nueva pestaña en el navegador correspondiente al perfil activo
    await window.electronAPI.openPatreon(currentSession.activeProfile);
    
    // Esperar a que la página cargue y la extensión esté lista
    let waitTime = 6000;
    const chkSlow = document.getElementById('chk-slow-conn');
    const numSlow = document.getElementById('num-slow-conn');
    if (chkSlow && chkSlow.checked && numSlow) {
        waitTime = parseInt(numSlow.value) * 1000;
        if (isNaN(waitTime) || waitTime < 3000) waitTime = 6000;
    }
    
    await new Promise(r => setTimeout(r, waitTime));
    
    if (!isAutoUploading) return; // user cancelled

    // Construir payload con fallback seguro a los datos del objeto post
    const globalDate = document.getElementById('global-date')?.value || '';
    const globalTime = document.getElementById('global-time')?.value || '';
    
    let editedTitle = post.title;
    let editedBaseTags = post.tags;
    let categoryOverride = post.categoryOverride || null;

    const cardCheckbox = document.querySelector(`.done-checkbox[data-id="${post.id}"]`);
    let card = null;
    if (cardCheckbox) {
        card = cardCheckbox.closest('.post-card') || cardCheckbox.parentElement?.parentElement?.parentElement;
    }
    
    if (card) {
        const titleInput = card.querySelector('.title-value');
        if (titleInput && titleInput.value) editedTitle = titleInput.value;

        const tagsInput = card.querySelector('.tags-value');
        if (tagsInput && tagsInput.value) editedBaseTags = tagsInput.value;

        const categoryCbs = card.querySelectorAll('.category-cb');
        categoryCbs.forEach(cb => { if (cb.checked) categoryOverride = cb.dataset.category; });
    }
    
    const rarPath = post.path + '.rar';
    const collection = categoryOverride || post.anime;
    const finalTags = categoryOverride ? editedBaseTags + ', ' + categoryOverride : editedBaseTags;

    // Obtener link si existe, del DOM
    let currentLink = '';
    const linkEl = document.getElementById(`patreon-link-${post.id}`);
    if (linkEl) currentLink = linkEl.value;
    const linkPart = currentLink ? `${currentLink}\n\n` : '';

    const payload = {
        title: editedTitle,
        tags: finalTags,
        anime: collection,
        scheduleDate: globalDate,
        scheduleTime: globalTime,
        rarPath: rarPath,
        imagePaths: post.imagePaths || [],
        isBatch: true,
        isLastBatchItem: (autoUploadQueue.length === 0 && (!isSuperAutoMode || superAutoStage === 3)),
        twitterText: `${getRandomTwitterText()}\n\n${linkPart}${finalTags.split(',').map(t => '#' + t.trim().replace(/\\s+/g, '')).join(' ')}`
    };

    console.log(`[Post-Away Auto Upload] Enviando (${currentSession.activeProfile}): "${editedTitle}" con ${post.imagePaths?.length || 0} imágenes y archivo rar: "${rarPath}"`);

    // Enviar a Patreon (Extensión)
    const res = await window.electronAPI.fillPatreon(payload);
    if (!res.success && res.receivers === 0) {
        console.warn("Nadie recibió el payload, la extensión no está lista.");
    }

    // Marcar como procesado visualmente en la tarjeta
    if (cardCheckbox) {
        cardCheckbox.checked = true;
        if (card) card.classList.add('done');
        currentSession.donePosts[post.id] = true;
        await saveSession();
    }
}

// Escuchar el evento de completado desde la extensión
if (window.electronAPI.onUploadComplete) {
    window.electronAPI.onUploadComplete(async () => {
        if (isAutoUploading) {
            // Darle un respiro de 2 segundos entre post y post para no saturar el navegador
            await new Promise(r => setTimeout(r, 2000));
            await processNextAutoUpload();
        }
    });
}

async function handleRenameCharacter(element, folderPath, folderName, isViewer = false) {
    if (element.querySelector('input')) return;
    
    let cleanName = folderName;
    if (isViewer && folderName.startsWith('QC: ')) {
        cleanName = folderName.replace('QC: ', '');
    }
    
    const displayCleanName = getCleanCharacterName(cleanName);
    const exactNovaPath = await window.electronAPI.getNovaFolderPath(folderPath, currentSession.baseOrgPath, currentSession.novaOrgPath);
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = displayCleanName;
    input.className = 'glass-input';
    if (isViewer) {
        input.style.cssText = 'width: 100%; padding: 0.2rem; font-size: 1.25rem; font-weight: 500; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 4px;';
    } else {
        input.style.cssText = 'width: 100%; padding: 0.2rem; font-size: 0.95rem; font-weight: 600; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 4px; flex: 1;';
    }

    const originalContent = element.innerHTML;
    
    element.innerHTML = '';
    element.appendChild(input);
    input.focus();
    input.select();

    const commitRename = async () => {
        const newName = input.value.trim();
        if (newName && newName !== displayCleanName) {
            let success = true;
            
            // Renombrar Nicky (la ruta actual base)
            const oldNickyName = folderPath.substring(folderPath.lastIndexOf('\\') + 1);
            const regexNicky = new RegExp(displayCleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            const newNickyName = oldNickyName.replace(regexNicky, newName);
            
            const res1 = await window.electronAPI.renameFolder(folderPath, newNickyName);
            if (!res1.success) {
                alert("Error renombrando carpeta Nocky: " + res1.error);
                success = false;
            } else {
                if (exactNovaPath) {
                    const oldNovaName = exactNovaPath.substring(exactNovaPath.lastIndexOf('\\') + 1);
                    const regexNova = new RegExp(displayCleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                    const newNovaName = oldNovaName.replace(regexNova, newName);
                    const res2 = await window.electronAPI.renameFolder(exactNovaPath, newNovaName);
                    if (res2 && !res2.success) {
                        console.error("Error renombrando carpeta Nova: " + res2.error);
                    }
                }
            }
            if (success) {
                if (isViewer) {
                    const parent = folderPath.substring(0, folderPath.lastIndexOf('\\'));
                    viewerState.folderPath = parent + '\\' + newNickyName;
                    element.innerHTML = `QC: ${newName}`;
                    element.ondblclick = (e) => {
                        e.stopPropagation();
                        handleRenameCharacter(element, viewerState.folderPath, newNickyName, true);
                    };
                }
                
                if (gestorState.selectedMonth && gestorState.selectedDate) {
                    await loadDateCharacters();
                    renderGestorDateContentsList();
                }
                if (gestorState.outputCharacters) {
                    const post = gestorState.outputCharacters.find(p => p.path === folderPath);
                    if (post) {
                        const parent = folderPath.substring(0, folderPath.lastIndexOf('\\'));
                        post.path = parent + '\\' + newNickyName;
                        post.folderName = newNickyName;
                    }
                    renderGestorCharactersList();
                }
                return;
            }
        }
        element.innerHTML = originalContent;
    };

    input.addEventListener('blur', commitRename);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            input.blur();
        } else if (e.key === 'Escape') {
            element.innerHTML = originalContent;
        }
    });
}

