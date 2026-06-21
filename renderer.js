let currentSession = {
    lastFolder: null,
    donePosts: {}
};
let currentCompressionRun = null;
let currentPosts = [];
let currentCardsElements = [];
let isCompressingBackground = false;

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
    return twitterTexts[Math.floor(Math.random() * twitterTexts.length)];
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
        rarStatus.style.background = 'rgba(16, 185, 129, 0.2)';
        rarStatus.style.color = '#6ee7b7';
        rarStatus.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        rarStatus.innerHTML = `✅ ¡Todos los .rar están listos! (${completed}/${elements.length})`;

        const btnCompressAll = document.getElementById('btn-compress-all');
        if (btnCompressAll) btnCompressAll.style.display = 'none';
    } else if (elements.length > 0) {
        rarStatus.style.background = 'rgba(234, 179, 8, 0.2)';
        rarStatus.style.color = '#fde047';
        rarStatus.style.borderColor = 'rgba(234, 179, 8, 0.5)';
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

    const updateProfileUI = () => {
        const isNova = currentSession.activeProfile === 'nova';
        profileNova.checked = isNova;
        profileNicky.checked = !isNova;
        profileNovaLabel.style.background = isNova ? 'rgba(244, 114, 182, 0.2)' : 'transparent';
        profileNickyLabel.style.background = !isNova ? 'rgba(96, 165, 250, 0.2)' : 'transparent';
        
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

    const btnFetchPatreon = document.getElementById('btn-fetch-patreon');
    if (btnFetchPatreon) {
        btnFetchPatreon.addEventListener('click', async () => {
            const currentUrl = currentSession.patreonUrls[currentSession.activeProfile];
            if (!currentUrl) {
                alert("Por favor ingresa tu Link de Patreon en Configuraciones Generales para este perfil.");
                return;
            }
            
            btnFetchPatreon.textContent = "🔗 Buscando...";
            btnFetchPatreon.disabled = true;

            const result = await window.electronAPI.fetchPatreonLinks(currentUrl, currentPosts);
            
            if (result.success) {
                for (const post of currentPosts) {
                    if (result.links[post.folderName]) {
                        const inputId = `patreon-link-${post.id}`;
                        const inputEl = document.getElementById(inputId);
                        if (inputEl) {
                            inputEl.value = result.links[post.folderName];
                            inputEl.dispatchEvent(new Event('input'));
                        }
                    }
                }
                btnFetchPatreon.textContent = "✅ Links Obtenidos";
                setTimeout(() => {
                    btnFetchPatreon.textContent = "🔗 Obtener Links de Patreon";
                    btnFetchPatreon.disabled = false;
                }, 3000);
            } else {
                alert("Error obteniendo links de Patreon: " + result.error);
                btnFetchPatreon.textContent = "🔗 Obtener Links de Patreon";
                btnFetchPatreon.disabled = false;
            }
        });
    }

    document.getElementById('btn-clear').addEventListener('click', async () => {
        if (!confirm('¿Estás seguro de que quieres limpiar toda la grilla de posts? Esto removerá la carpeta actual y reiniciará tu panel.')) return;

        if (currentPosts && currentPosts.length > 0) {
            const folderPaths = currentPosts.map(p => p.path);
            await window.electronAPI.deleteRars(folderPaths);
        }

        currentSession.lastFolder = null;
        currentSession.donePosts = {};
        await saveSession();

        currentPosts = [];
        currentCardsElements = [];
        isCompressingBackground = false;
        currentCompressionRun = null;

        document.getElementById('btn-clear').style.display = 'none';
        const btnCompressAll = document.getElementById('btn-compress-all');
        if (btnCompressAll) btnCompressAll.style.display = 'none';
        document.getElementById('global-settings').classList.add('hidden');
        document.getElementById('path-indicator').classList.add('hidden');
        document.querySelectorAll('.grid-actions').forEach(el => el.style.display = 'none');
        document.getElementById('posts-grid').innerHTML = `
            <div class="empty-state">
                Selecciona una carpeta para comenzar a organizar tus posts.
            </div>
        `;
        document.getElementById('twitter-grid').innerHTML = `
            <div class="empty-state">
                No hay carpetas seleccionadas.
            </div>
        `;
    });
});

async function navigateToFolder(newPath) {
    if (!newPath) return;
    if (currentPosts && currentPosts.length > 0) {
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
            agregadosBanner.style.background = 'rgba(168, 85, 247, 0.2)';
            agregadosBanner.style.color = '#d8b4fe';
            agregadosBanner.style.border = '1px solid rgba(168, 85, 247, 0.5)';
            agregadosBannerIcon.innerHTML = '🟣';
            agregadosBannerText.textContent = 'Estás en MODO AGREGADOS. Gestiona los nuevos personajes y fusiónalos al terminar.';
            
            headerElement.style.borderBottom = '2px solid rgba(168, 85, 247, 0.6)';

            const btnBack = document.createElement('button');
            btnBack.className = 'btn';
            btnBack.style.cssText = 'background: rgba(255,255,255,0.1); color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer;';
            btnBack.textContent = '🔙 Volver a la original';
            btnBack.onclick = () => navigateToFolder(folderPath.replace(/_agregados$/i, ''));

            const btnMerge = document.createElement('button');
            btnMerge.className = 'btn primary-btn';
            btnMerge.style.cssText = 'background: linear-gradient(135deg, #9333ea, #7e22ce); border: none; padding: 0.4rem 0.8rem;';
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
                agregadosBanner.style.background = 'rgba(234, 179, 8, 0.2)';
                agregadosBanner.style.color = '#fde047';
                agregadosBanner.style.border = '1px solid rgba(234, 179, 8, 0.5)';
                agregadosBannerIcon.innerHTML = '⚠️';
                agregadosBannerText.textContent = 'Tienes personajes agregados pendientes de fusionar en una carpeta separada.';
                
                const btnGo = document.createElement('button');
                btnGo.className = 'btn';
                btnGo.style.cssText = 'background: rgba(234, 179, 8, 0.3); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.5); padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer;';
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
    if (btnCompressAll) {
        btnCompressAll.style.display = 'block';
        btnCompressAll.disabled = false;
        btnCompressAll.textContent = "📦 Iniciar Compresión de Todos los .rar";
        btnCompressAll.style.cursor = "pointer";
        btnCompressAll.style.opacity = "1";
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

            <div class="card-actions" style="margin-top: 1rem;">
                <button class="btn primary-btn btn-copy-all" style="width: 100%; background: linear-gradient(135deg, #1DA1F2, #0d8bd9);">📋 Copiar Todo (EN + ES + Link + Tags)</button>
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

        // Auto-sizing textareas
        card.querySelectorAll('textarea').forEach(tx => {
            tx.style.height = 'auto';
            tx.style.height = (tx.scrollHeight) + 'px';
            tx.addEventListener('input', () => {
                tx.style.height = 'auto';
                tx.style.height = (tx.scrollHeight) + 'px';
            });
        });

        twitterGrid.appendChild(card);
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

function showDateContextMenu(x, y, monthName, dateName) {
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
});

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

    characters.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.style.cssText = "padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;";
        
        const isQcDone = currentSession.qcDone && currentSession.qcDone[post.folderName];

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="font-weight: 600; font-size: 0.95rem; color: #fff; word-break: break-all;">${post.folderName}</div>
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

        const btnViewImages = card.querySelector('.btn-view-images');
        btnViewImages.onclick = () => openImageViewer(post.path, post.folderName);

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

    countEl.textContent = `${gestorState.outputCharacters.length} encontrados (Ocultando versiones Nova)`;

    const sortType = document.getElementById('gestor-output-sort') ? document.getElementById('gestor-output-sort').value : 'alpha';
    if (sortType === 'alpha') {
        gestorState.outputCharacters.sort((a, b) => a.folderName.localeCompare(b.folderName));
    } else if (sortType === 'date-desc') {
        gestorState.outputCharacters.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (sortType === 'date-asc') {
        gestorState.outputCharacters.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    }

    container.innerHTML = '';
    if (gestorState.outputCharacters.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;">No hay personajes en Output.</div>';
        return;
    }

    gestorState.outputCharacters.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.style.cssText = "padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;";
        
        const novaBadge = ''; // Ya no mostramos la placa Nova porque solo mostramos los Nicky
        const isQcDone = currentSession.qcDone && currentSession.qcDone[post.folderName];

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="font-weight: 600; font-size: 0.95rem; color: #fff; word-break: break-all;">${post.folderName} ${novaBadge}</div>
                <button class="btn btn-qc" style="background: ${isQcDone ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)'}; color: ${isQcDone ? '#4ade80' : '#fff'}; border: 1px solid ${isQcDone ? '#4ade80' : 'rgba(255,255,255,0.2)'}; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer;" title="Marcar Control de Calidad">
                    ${isQcDone ? '✅ QC OK' : '❌ Sin QC'}
                </button>
            </div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.2rem;">${post.imagesCount} Imágenes</div>
            <button class="btn btn-view-images" style="background: rgba(139, 92, 246, 0.2); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.4); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer; margin-top: 0.2rem;">🖼️ Ver Imágenes</button>
            <button class="btn primary-btn btn-move" style="margin-top: auto; padding: 0.4rem; font-size: 0.85rem;" ${!gestorState.selectedDate ? 'disabled' : ''}>
                Mover a ${gestorState.selectedDate || 'Fecha no seleccionada'}
            </button>
        `;

        const btnViewImages = card.querySelector('.btn-view-images');
        btnViewImages.onclick = () => openImageViewer(post.path, post.folderName);

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
                    await loadGestorCharacters();
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
        const post = gestorState.outputCharacters[index];
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
                    await loadGestorCharacters();
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

        for (let day = 1; day <= daysInMonth; day += 2) {
            const newDd = String(day).padStart(2, '0');
            const newMm = String(month).padStart(2, '0');
            const newYy = String(year).slice(-2);
            
            const newDateName = `${newDd}-${newMm}-${newYy}`;
            await window.electronAPI.createDateFolder(currentSession.baseOrgPath, gestorState.selectedMonth, newDateName);
            if (currentSession.novaOrgPath) {
                await window.electronAPI.createDateFolder(currentSession.novaOrgPath, gestorState.selectedMonth, newDateName);
            }
        }
        
        btn.textContent = "Generar Mes Completo (+2 días)";
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
                    item.onmouseover = () => item.style.background = 'rgba(255,255,255,0.05)';
                    item.onmouseout = () => item.style.background = 'transparent';
                    
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
    document.getElementById('image-viewer-title').textContent = `QC: ${folderName}`;
    
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
    
    await loadViewerImages();
    
    document.getElementById('image-viewer-modal').style.display = 'flex';
}

async function loadViewerImages() {
    const grid = document.getElementById('image-viewer-grid');
    grid.innerHTML = '<div style="color: white; grid-column: 1/-1; text-align: center;">Cargando imágenes...</div>';
    
    const images = await window.electronAPI.getFolderImages(viewerState.folderPath);
    viewerState.images = images;
    
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
