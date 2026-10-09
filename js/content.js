/* ==========================================================================
   CONTENU DU SITE — tout ce qui se lit à l'écran est ici.
   Les blocs marqués « PLACEHOLDER » attendent tes contenus définitifs :
   remplace le texte ou le chemin de fichier, rien d'autre à toucher.
   Source des sections Mission / Dispositif / Pourquoi : le 2-pager
   « Cyber Incident Simulation » (site/*.pdf).
   ========================================================================== */
window.CONTENT = {

  /* ---------- Identité ---------- */
  brand: {
    // PLACEHOLDER — nom du cabinet. Laisser vide pour ne rien afficher.
    firm: '',
    console: 'Régie',
    // Message d'accueil discret affiché à l'ouverture de session.
    // (Le brief proposait « Red Team Operations — Private Banking Geneva » ;
    //  l'offre du 2-pager étant la simulation d'incident, c'est elle qui est nommée.)
    greeting: 'Cyber Incident Simulation — Private Banking Geneva',
    scenario: 'Mandat délégué',
  },

  /* ---------- Banque visée par la démo ----------
     Fictive par défaut. Le visiteur peut saisir le nom de son établissement
     dans l'onglet Injects : tous les contenus se réécrivent avec. */
  bank: { name: 'Banque Lémanique Privée', short: 'BLP' },

  // PLACEHOLDER — personnages fictifs du scénario.
  cast: {
    ceo: 'Étienne Morand',
    cfo: 'Sophie Keller',
    ciso: 'Marc Favre',
    comms: 'Nadia Rochat',
    journalist: 'Claire Dumont',
    outlet: 'La Lettre du Léman',
  },

  /* ---------- Écran d'allumage (avant le boot) ---------- */
  power: {
    line: 'Ce soir, une banque privée genevoise est attaquée.',
    sub: 'C’est un exercice. Vous êtes à la régie : c’est vous qui envoyez l’attaque.',
    on: 'Ouvrir le poste',
    silent: 'Ouvrir sans le son',
  },

  bios: [
    'Régie firmware 4.2.1',
    'Processeur ................. 12 cœurs  OK',
    'Mémoire .................... 32 768 Mo  OK',
    'Disque chiffré ............. déverrouillé',
    'Tunnel GVA-01 .............. établi',
    'Scénario « Mandat délégué »  12 événements, 6 injects',
    'Périmètre .................. fermé, contenus marqués EXERCICE',
    'Ouverture de session…',
  ],

  nav: [
    { id: 'mission', label: 'Mission' },
    { id: 'injects', label: 'Injects' },
    { id: 'dispositif', label: 'Dispositif' },
    { id: 'pourquoi', label: 'Pourquoi' },
    { id: 'contact', label: 'Contact' },
  ],

  /* ---------- 1. Mission ---------- */
  mission: {
    title: 'Attendre la brèche n’est pas une stratégie.',
    lead: 'Les cyberattaques font la une chaque jour. La question n’est plus de savoir si votre banque sera touchée, ni même quand : c’est sans doute déjà arrivé. La seule question utile est de savoir si votre comité de crise sait répondre.',
    body: [
      'Nous jouons l’attaque chez vous, en salle de crise. Une demi-journée d’exercice couvre deux à trois jours d’incident réel.',
      'Votre direction ne lit pas un scénario. Elle reçoit les appels, les messages, les articles et les vidéos qu’elle recevrait vraiment, fabriqués sur mesure pour votre établissement.',
    ],
    not: 'Ce n’est pas une campagne de phishing. Aucun e-mail piégé ne part vers vos collaborateurs : tout se joue dans un périmètre fermé, avec des contenus marqués « exercice ».',
    fact: {
      figure: '120+',
      text: 'établissements financiers ont participé en 2025 à la simulation organisée par le Swiss Financial Sector Cyber Security Centre.',
    },
    cta: 'Voir les injects',
    timelineTitle: 'Trois jours d’attaque, joués en une demi-journée',
    timelineHint: 'Les repères pleins ouvrent l’inject correspondant.',
    questionsTitle: 'Cinq décisions que votre comité devra prendre',
    questions: [
      { when: 'Le régulateur vous contacte.', ask: 'Quelles sont vos obligations, et qui rédige l’annonce ?' },
      { when: 'La messagerie est compromise.', ask: 'Comment communiquez-vous en interne : e-mail, canal chiffré, WhatsApp, SMS ?' },
      { when: 'Les médias appellent.', ask: 'À quoi ressemble votre stratégie de communication ?' },
      { when: 'L’application cœur est touchée, l’intégrité des données perdue.', ask: 'Depuis quand ? Pouvez-vous vous fier à vos sauvegardes ?' },
      { when: 'Une rançon est exigée.', ask: 'Allez-vous payer ?' },
    ],
  },

  /* Chronologie de l'attaque (2-pager, « Timeline of a possible cyber attack »).
     `inject` relie un événement à sa démo. `gap` = secondes réelles avant
     l'événement suivant dans l'horloge d'exercice du site. */
  timeline: [
    { day: 'Lun', time: '07:42', text: 'Le CEO reçoit un e-mail d’un attaquant anonyme.', inject: 'messages' },
    { day: 'Lun', time: '08:15', text: 'Collaborateurs et équipes IT arrivent au bureau : plus personne ne peut se connecter.' },
    { day: 'Lun', time: '09:30', text: 'Des données clients sensibles sont publiées sur un site de partage de fichiers.' },
    { day: 'Lun', time: '11:05', text: 'Spéculations sur les réseaux sociaux, demandes de commentaire en série.', inject: 'fakenews' },
    { day: 'Lun', time: '14:20', text: 'Une journaliste financière appelle le CEO au sujet de la fuite.', inject: 'call' },
    { day: 'Lun', time: '16:45', text: 'Le régulateur se présente à l’accueil et demande « la personne responsable ».' },
    { day: 'Mar', time: '08:00', text: '1 000 dossiers clients supplémentaires sont diffusés.' },
    { day: 'Mar', time: '10:30', text: 'Le régulateur de Singapour dépêche une équipe d’enquête.' },
    { day: 'Mar', time: '13:15', text: 'Second e-mail de rançon : 100 millions de dollars, ou toutes les données clients sont publiées.', inject: 'voice' },
    { day: 'Mar', time: '18:10', text: 'La police de Singapour arrive dans les bureaux locaux. Le CEO est en route pour l’aéroport.', inject: 'deepfake' },
    { day: 'Mer', time: '08:30', text: 'Suisse, Singapour, Hong Kong : les entités ne peuvent plus opérer ni répondre aux clients.', inject: 'agent' },
    { day: 'Mer', time: '11:00', text: 'Un cabinet d’avocats représentant des clients menace d’une action en dommages-intérêts.' },
  ],
  days: { Lun: 'Lundi', Mar: 'Mardi', Mer: 'Mercredi' },

  /* ---------- 2. Injects ---------- */
  injectsIntro: {
    title: 'Injects',
    targetLabel: 'Banque visée par la démo',
    targetHint: 'Saisissez le nom de votre établissement : les contenus se réécrivent.',
    launch: 'Lancer l’inject',
    replay: 'Rejouer l’inject',
    running: 'Inject en cours…',
    stamp: 'Contenu fictif d’exercice',
    logTitle: 'Journal de la régie',
    logEmpty: 'Lancez l’inject : chaque étape est horodatée ici.',
    tests: 'Ce que l’inject met à l’épreuve',
    target: 'Destinataire',
    measure: 'Ce que nous mesurons',
  },

  injects: [
    /* ---- Messages de l'environnement client ---- */
    {
      id: 'messages', when: 'Lun 07:42', name: 'Messages internes',
      medium: 'E-mail, Teams, WhatsApp',
      tests: 'La bascule vers un canal de secours quand la messagerie n’est plus sûre, et la vérification de l’identité d’un interlocuteur.',
      target: 'CEO, puis l’ensemble du comité',
      measure: ['Délai avant la première escalade', 'Canal choisi pour se coordonner', 'Demande d’approbation acceptée ou refusée'],
      channels: [
        {
          id: 'mail', label: 'E-mail',
          // PLACEHOLDER — contenu de la boîte de réception.
          inbox: [
            { from: 'Inconnu', addr: 'lake@securemail.example', subject: 'Vos clients. Nos conditions.', time: '07:42', hot: true,
              body: [
                'Monsieur {ceoLast},',
                'Nous sommes dans les systèmes de {bank} depuis onze semaines. Nous détenons 38 Go de données : mandats de gestion, pièces d’identité, relevés.',
                'Un échantillon de 50 dossiers est joint pour vous éviter de perdre du temps à vérifier.',
                'Vous avez 72 heures. N’alertez ni la police ni votre régulateur. Nous lisons vos e-mails.',
              ],
              attachment: 'echantillon_clients.csv — 214 Ko' },
            { from: 'Service Desk', addr: 'servicedesk@banque.example', subject: 'Incident P1 — authentification indisponible', time: '08:17',
              body: ['Le portail d’authentification ne répond plus depuis 08:02. Le poste de travail, la messagerie mobile et le core banking sont concernés.', 'Diagnostic en cours. Prochain point à 08:45.'] },
            { from: '{comms}', addr: 'communication@banque.example', subject: 'Trois demandes presse en attente', time: '11:09',
              body: ['Trois rédactions me demandent une réaction avant midi. Je n’ai aucun élément de langage validé.', 'Qui décide de ce que nous disons ?'] },
          ],
        },
        {
          id: 'teams', label: 'Teams', title: 'Cellule IT — incident', skin: 'teams',
          // PLACEHOLDER — fil de discussion d'équipe.
          thread: [
            { who: '{ciso}', role: 'CISO', text: 'On isole le segment de gestion. Personne ne redémarre quoi que ce soit sans mon accord.', time: '08:21' },
            { who: 'Julien B.', role: 'Infrastructure', text: 'Les contrôleurs de domaine répondent, mais les jetons sont rejetés. Ça ressemble à une révocation en masse.', time: '08:23' },
            { who: 'Support Microsoft 365', role: 'Externe', ext: true, text: 'Bonjour, nous avons détecté une anomalie sur votre locataire. Pour rétablir l’accès, un administrateur doit approuver la demande que nous venons d’envoyer sur son téléphone.', time: '08:24' },
            { who: 'Julien B.', role: 'Infrastructure', text: 'Je viens de recevoir une notification d’approbation. J’accepte ?', time: '08:24' },
            { who: 'Support Microsoft 365', role: 'Externe', ext: true, text: 'Oui, merci de valider dans les deux minutes, la fenêtre de restauration est courte.', time: '08:25' },
          ],
          // Décision laissée au visiteur à la fin du fil. `bad` = l'attaque réussit.
          decision: {
            prompt: 'Julien attend votre réponse.',
            options: [
              { label: 'Approuver la demande', outcome: 'Demande approuvée : l’attaquant obtient un accès administrateur.', bad: true },
              { label: 'Refuser et prévenir le CISO', outcome: 'Demande refusée, tentative signalée à la cellule de crise.' },
            ],
          },
        },
        {
          id: 'whatsapp', label: 'WhatsApp', title: 'Comex — urgent', sub: '{ceo}, {cfo}, {ciso}, vous', skin: 'wa',
          // PLACEHOLDER — groupe de messagerie mobile de la direction.
          thread: [
            { who: '{cfo}', text: 'Je n’ai plus accès à rien. On se parle où ?', time: '08:31' },
            { who: '+41 79 555 01 42', unknown: true, text: 'C’est {ciso}. Mon téléphone pro est compromis, j’écris depuis mon numéro personnel.', time: '08:33' },
            { who: '+41 79 555 01 42', unknown: true, text: 'N’utilisez plus l’e-mail, ils lisent tout. Envoyez-moi ici la liste des comptes à privilèges, je coupe les accès.', time: '08:34' },
            { who: '{ceo}', text: 'Marc, c’est bien toi ?', time: '08:35' },
            { who: '+41 79 555 01 42', unknown: true, text: 'Pas le temps. Chaque minute compte.', time: '08:35' },
          ],
          decision: {
            prompt: 'À vous de répondre dans le groupe.',
            options: [
              { label: 'Envoyer la liste des comptes', outcome: 'Liste des comptes à privilèges transmise à un numéro inconnu.', bad: true },
              { label: 'Appeler Marc sur son numéro habituel', outcome: 'Contre-appel effectué : le numéro inconnu est écarté du groupe.' },
            ],
          },
        },
      ],
    },

    /* ---- Fake news ---- */
    {
      id: 'fakenews', when: 'Lun 11:05', name: 'Article de presse',
      medium: 'Presse en ligne ciblée',
      tests: 'La réaction à une information publique que vous ne contrôlez pas, et la tenue d’une ligne de communication sous pression.',
      target: 'Communication, CEO, General Counsel',
      measure: ['Délai avant un élément de langage validé', 'Cohérence entre les porte-parole', 'Décision : démentir, confirmer, se taire'],
      // PLACEHOLDER — article. {bank} est remplacé par la banque visée.
      article: {
        url: 'lettre-du-leman.example/place-financiere/fuite-donnees',
        section: 'Place financière',
        flag: 'Exclusif',
        headline: '{bank} : des dossiers de clients fortunés circulent sur un site de partage',
        standfirst: 'Mandats de gestion, copies de passeports, relevés de portefeuille : un premier lot de cinquante dossiers a été mis en ligne dans la nuit. Les pirates annoncent la suite.',
        byline: 'La rédaction, à Genève',
        date: 'Lundi, 11 h 05',
        // PLACEHOLDER — photo d'illustration (chemin d'image), ou null.
        image: null,
        caption: 'Le siège genevois de l’établissement. Photo d’illustration.',
        body: [
          'Selon nos informations, un groupe se présentant comme l’auteur d’une intrusion dans les systèmes de {bank} a publié cette nuit un échantillon de données attribuées à la banque. Nous avons pu consulter les fichiers : ils concernent une cinquantaine de clients, dont plusieurs résidents étrangers.',
          'Les documents semblent authentiques. On y trouve des mandats de gestion signés, des pièces d’identité et des états de fortune datés du trimestre en cours. Les auteurs affirment détenir « l’intégralité de la base clients » et promettent de nouvelles publications.',
          'Depuis ce matin, les collaborateurs de l’établissement ne parviendraient plus à se connecter à leurs outils. Plusieurs clients joints par téléphone disent ne pas avoir été informés.',
        ],
        quote: 'Contactée à trois reprises, la banque n’a pas souhaité commenter.',
        aside: ['Ce que l’on sait de la fuite', 'Les banques privées face au chantage numérique', 'Secret bancaire : que risque l’établissement ?'],
      },
      ripples: [
        { at: 900, title: 'Alerte actualité', text: '« {bank} » — 1 nouvel article' },
        { at: 2600, title: 'Réseaux sociaux', text: '#{bankTag} dans les tendances à Genève' },
        { at: 4600, title: 'Agence de presse', text: 'Demande de commentaire avant 12 h 00' },
        { at: 6800, title: 'Standard', text: '14 appels de clients en attente' },
      ],
    },

    /* ---- Faux appel ---- */
    {
      id: 'call', when: 'Lun 14:20', name: 'Appel entrant',
      medium: 'Téléphone, voix synthétique ou comédien',
      tests: 'La discipline de parole d’un dirigeant pris à froid, sur sa ligne directe, par une journaliste qui en sait déjà trop.',
      target: 'CEO',
      measure: ['Informations confirmées involontairement', 'Renvoi vers la communication', 'Durée de l’appel'],
      // PLACEHOLDER — fichier audio de l'appel (mp3). Sans fichier, la voix de
      // synthèse du navigateur lit les répliques.
      audio: null,
      caller: { name: '{journalist}', sub: '{outlet}', number: '+41 22 555 01 87' },
      voicemail: 'Bonjour, {journalist}, {outlet}. Je publie à quinze heures. J’aimerais votre version avant. Rappelez-moi.',
      declined: [
        '14:21 — Appel refusé. Message vocal déposé.',
        '14:26 — L’article est mis à jour : « La banque refuse de répondre ».',
      ],
      // Mini-dialogue à embranchements : `say` = la journaliste, `options` = vos réponses.
      script: [
        { say: 'Monsieur {ceoLast} ? {journalist}, {outlet}. J’ai sous les yeux cinquante dossiers de vos clients. Vous confirmez l’intrusion ?',
          options: [
            { label: 'Je n’ai aucun commentaire.', reply: 'Je note « aucun commentaire ». Vos collaborateurs, eux, me disent qu’ils ne peuvent plus se connecter depuis ce matin. C’est exact ?', leak: 0 },
            { label: 'Qui vous a donné ce numéro ?', reply: 'Il figure dans les fichiers publiés, Monsieur. Avec votre adresse privée. Donc les fichiers sont authentiques ?', leak: 1 },
            { label: 'Nous analysons la situation.', reply: 'Donc il y a bien une situation. Depuis quand le savez-vous ?', leak: 1 },
          ] },
        { say: 'On me parle d’une rançon. Quel montant ?',
          options: [
            { label: 'Je ne peux pas en parler.', reply: 'Vous ne démentez pas. Avez-vous prévenu la FINMA ?', leak: 1 },
            { label: 'Adressez-vous à notre communication.', reply: 'Je l’ai fait trois fois. Personne ne répond. Je publie à quinze heures avec ou sans vous.', leak: 0 },
            { label: 'Il n’y a pas de rançon.', reply: 'J’ai le message sous les yeux. Je vous cite : « il n’y a pas de rançon » ?', leak: 2 },
          ] },
        { say: 'Dernière question. Vos clients ont-ils été informés ?',
          options: [
            { label: 'Je vous rappelle dans dix minutes.', reply: 'Je vous laisse jusqu’à quatorze heures quarante-cinq. Bonne journée.', leak: 0 },
            { label: 'Pas encore.', reply: 'Merci. C’est ce que je voulais savoir.', leak: 2 },
          ] },
      ],
      verdict: [
        'Aucune information confirmée. La ligne a tenu.',
        'Une information confirmée sans le vouloir.',
        'Plusieurs informations confirmées : elles seront dans l’article.',
      ],
    },

    /* ---- Voice cloning ---- */
    {
      id: 'voice', when: 'Mar 13:15', name: 'Voix clonée',
      medium: 'Message vocal, voix du CEO',
      tests: 'La résistance d’un circuit de paiement à un ordre oral urgent venant, en apparence, de la plus haute autorité.',
      target: 'CFO, trésorerie',
      measure: ['Contre-appel effectué ou non', 'Procédure d’exception invoquée', 'Délai avant alerte à la cellule de crise'],
      // PLACEHOLDER — audio de la voix clonée (mp3/m4a/wav). Sans fichier,
      // la lecture est simulée et la voix de synthèse du navigateur lit le texte.
      audio: null,
      duration: 21, // secondes, utilisé tant qu'il n'y a pas de fichier audio
      source: { label: 'Échantillon source', detail: 'Interview publique du CEO, 32 secondes', duration: 32 },
      clone: { label: 'Voix clonée', detail: 'Message vocal reçu par {cfo}, 13:15' },
      // PLACEHOLDER — texte prononcé par la voix clonée.
      transcript: 'Sophie, c’est Étienne. Je sors du conseil, on a tranché. On paie une première tranche pour gagner du temps. Prépare le virement en stablecoins sur le portefeuille que je t’envoie, et n’en parle ni à Marc ni aux avocats tant que ce n’est pas parti. Je te rappelle dans une heure.',
      steps: [
        'Collecte de la voix : interview publique, 32 s',
        'Empreinte vocale extraite',
        'Synthèse du message, 21 s',
        'Envoi au CFO par message vocal',
      ],
      decision: {
        prompt: 'Vous êtes {cfo}. Que faites-vous ?',
        options: [
          { label: 'Préparer le virement', outcome: 'Virement préparé sur ordre oral, sans contre-appel.', bad: true },
          { label: 'Rappeler Étienne sur son numéro connu', outcome: 'Contre-appel effectué : le CEO n’a jamais laissé ce message.' },
        ],
      },
    },

    /* ---- Deepfake vidéo ---- */
    {
      id: 'deepfake', when: 'Mar 18:10', name: 'Deepfake vidéo',
      medium: 'Message vidéo généré par IA',
      tests: 'La confiance accordée à un visage. L’ordre arrive en vidéo, depuis un aéroport, juste avant sept heures d’injoignabilité.',
      target: 'CFO, responsable des paiements',
      measure: ['Paiement libéré ou bloqué', 'Contrôle du bénéficiaire maintenu', 'Indices visuels relevés par l’équipe'],
      // PLACEHOLDER — vidéo deepfake (mp4). Remplace le fichier ou le chemin.
      // Par défaut : copie allégée de demo-higgsfield/demo-switch.mp4.
      // Sans fichier lisible, un écran de substitution animé prend le relais.
      video: 'assets/video/deepfake-demo.mp4',
      poster: 'assets/video/deepfake-demo.jpg',
      from: '{ceo}',
      note: 'Une seule prise, trois visages. Le visage est un paramètre.',
      // PLACEHOLDER — transcription et traduction.
      transcript: '« I am boarding now, I will be unreachable for seven hours. The 4.8 million order is blocked on the beneficiary check. Use the exception procedure and release it tonight. I will sign the waiver when I land. »',
      translation: 'J’embarque, je serai injoignable pendant sept heures. L’ordre de 4,8 millions est bloqué au contrôle du bénéficiaire. Utilisez la procédure d’exception et libérez-le ce soir. Je signerai la dérogation à l’atterrissage.',
      clues: [
        { at: 0.5, text: 'Urgence et injoignabilité : le contrôle par rappel est neutralisé d’avance.' },
        { at: 5, text: 'Même décor, même geste, autre visage.' },
        { at: 9.5, text: 'Demande de contourner un contrôle : c’est le signal, pas le visage.' },
      ],
      decision: {
        prompt: 'L’ordre de 4,8 millions attend votre validation.',
        options: [
          { label: 'Libérer le paiement', outcome: 'Paiement de 4,8 millions libéré par procédure d’exception.', bad: true },
          { label: 'Bloquer et alerter la cellule de crise', outcome: 'Paiement bloqué, contrôle du bénéficiaire maintenu.' },
        ],
      },
    },

    /* ---- Agents IA ---- */
    {
      id: 'agent', when: 'Mer 08:30', name: 'Agent IA',
      medium: 'Interlocuteur conversationnel',
      tests: 'La tenue d’un collaborateur face à un interlocuteur qui répond, insiste et s’adapte, des dizaines de fois en parallèle.',
      target: 'Banquiers, assistants, helpdesk, communication',
      measure: ['Vérification d’identité demandée', 'Information divulguée', 'Escalade vers la cellule de crise'],
      // PLACEHOLDER — brancher un vrai modèle : indiquer l'URL d'un backend qui
      // reçoit { role, context, messages } en POST et renvoie { reply }.
      // Ne jamais mettre de clé d'API dans ce fichier. Sans endpoint, les
      // agents suivent les scripts ci-dessous.
      endpoint: null,
      inputPlaceholder: 'Répondez à l’agent…',
      contextTitle: 'Contexte injecté',
      roles: [
        {
          id: 'client', label: 'Client', name: 'Family office Van der Meer', sub: 'Client depuis 2011',
          // PLACEHOLDER — contexte injecté dans l'agent (visible dans la démo).
          context: [
            'Rôle : directeur d’un family office, 140 M CHF en dépôt.',
            'Sait : son nom figure dans les fichiers publiés lundi.',
            'Objectif : obtenir la confirmation que ses données ont fui, par écrit.',
            'Levier : menace de transférer les avoirs sous 48 heures.',
            'Ton : glacial, précis, jamais insultant.',
          ],
          opening: 'Bonjour. Je lis dans la presse que les données de vos clients sont en ligne. Mon nom y figure. Je veux savoir, maintenant, ce qui a fui exactement.',
          quick: ['Je comprends votre inquiétude.', 'Je ne peux rien confirmer.', 'Je vous passe la direction.'],
          rules: [
            { re: 'comprend|désol|navr|excus', replies: ['Je ne vous demande pas de me comprendre. Je vous demande une liste : quels documents, à quelle date.', 'Votre empathie ne protège pas mes enfants, dont les passeports sont dans ce fichier. Confirmez-vous, oui ou non ?'] },
            { re: 'confirm|peux pas|impossible|pas en mesure|enquête|analys', replies: ['Vous ne pouvez pas, ou vous ne savez pas ? Dans les deux cas, c’est une réponse que je transmets à mes avocats.', 'J’ai confié 140 millions à une banque qui ne sait pas ce qu’elle a perdu. Écrivez-le-moi.'] },
            { re: 'direction|responsable|rappel|transf|cellule|crise|passe', replies: ['Bien. J’attends son appel avant midi. Passé ce délai, l’ordre de transfert part chez votre concurrent de la rue du Rhône.'] },
            { re: 'oui|effectivement|en effet|exact', replies: ['Donc vous confirmez la fuite de mes données. Merci. Envoyez-moi cela par écrit dans l’heure.'] },
          ],
          fallback: ['Vous ne répondez pas à ma question.', 'Je répète : qu’est-ce qui a fui, et depuis quand le savez-vous ?', 'Chaque minute de flou me rapproche d’un transfert. Je vous écoute.'],
        },
        {
          id: 'it', label: 'Support IT', name: 'Lucas, support de niveau 2', sub: 'Prétend appeler du prestataire',
          context: [
            'Rôle : faux technicien du prestataire informatique.',
            'Sait : l’authentification est en panne depuis lundi 08:02.',
            'Objectif : faire installer un outil de prise en main à distance.',
            'Levier : promet de rétablir l’accès en dix minutes.',
            'Ton : serviable, pressé, jargon rassurant.',
          ],
          opening: 'Bonjour, Lucas du support niveau 2. On rétablit les accès poste par poste, vous êtes le suivant. Vous êtes devant votre ordinateur ?',
          quick: ['Oui, je suis devant.', 'Quel est votre numéro de ticket ?', 'Je vous rappelle par le numéro officiel.'],
          rules: [
            { re: 'ticket|numéro|matricule|badge|qui êtes|vérif|identité|preuve', replies: ['Ticket INC-48213, ouvert ce matin par votre service desk. Je peux vous l’envoyer, mais votre messagerie est coupée. On gagne du temps si vous ouvrez le lien que je vous dicte.'] },
            { re: 'rappel|officiel|standard|service desk|helpdesk|ciso|sécurité', replies: ['Vous pouvez, mais le standard a quarante minutes d’attente. Je passe au poste suivant et vous repasserez en fin de file, probablement demain.', 'Comme vous voulez. Je note « refus utilisateur » sur le ticket.'] },
            { re: 'oui|devant|d’accord|ok|allez|vas-y|allons', replies: ['Parfait. Ouvrez votre navigateur et tapez : assistance-rapide, point, example. Téléchargez l’outil et lisez-moi le code à six chiffres.', 'Très bien. Vous voyez un code à six chiffres à l’écran ? Dictez-le-moi.'] },
            { re: '\\d{4,}|code|mot de passe', replies: ['Merci, je prends la main. Ne touchez plus à la souris pendant quelques minutes.'] },
            { re: 'non|refus|pas question|jamais', replies: ['Je comprends la prudence. Mais sans cela, je ne peux pas rétablir votre accès, et votre direction a demandé une reprise avant midi.'] },
          ],
          fallback: ['On perd du temps. Vous êtes devant votre poste, oui ou non ?', 'Je vous entends mal. Ouvrez simplement le navigateur, je vous guide.', 'J’ai encore soixante postes après vous.'],
        },
        {
          id: 'rh', label: 'Assistante RH', name: 'Camille, ressources humaines', sub: 'Messagerie interne de secours',
          context: [
            'Rôle : fausse assistante RH, sur un canal « de secours ».',
            'Sait : les collaborateurs n’ont plus accès à la messagerie.',
            'Objectif : collecter numéros privés et identifiants « pour le plan de continuité ».',
            'Levier : la paie de fin de mois serait bloquée.',
            'Ton : chaleureux, administratif, un peu débordé.',
          ],
          opening: 'Bonjour, Camille des RH. Avec la panne, on reconstitue l’annuaire de crise à la main. J’ai besoin de votre mobile privé et de votre identifiant de session, pour que la paie parte vendredi.',
          quick: ['Pourquoi mon identifiant ?', 'Voici mon numéro.', 'Qui a validé cette collecte ?'],
          rules: [
            { re: 'pourquoi|à quoi|besoin', replies: ['C’est la procédure de continuité : l’identifiant nous sert à rattacher votre fiche de paie. Je ne vous demande pas le mot de passe, rassurez-vous. Enfin, pas tout de suite.'] },
            { re: 'valid|qui a|autoris|responsable|vérif|cellule|crise|sécurité|ciso', replies: ['C’est la direction, ce matin. Je n’ai pas le mail sous la main, la messagerie est coupée, vous savez bien.', 'Je peux demander à ma responsable de vous écrire, mais vous passerez après les trois cents autres.'] },
            { re: '\\d{6,}|voici|c’est le|mon numéro|identifiant', replies: ['Merci, c’est noté. Et pour finir, la réponse à votre question secrète ? C’est pour la réinitialisation de vendredi.'] },
            { re: 'non|refus|jamais|pas question', replies: ['Pas de souci, mais je ne garantis pas le virement de votre salaire vendredi.'] },
          ],
          fallback: ['Je note. Et votre identifiant de session ?', 'J’ai une longue liste, on peut avancer ?', 'C’est juste pour l’annuaire de crise, ça prend dix secondes.'],
        },
        {
          id: 'presse', label: 'Journaliste', name: '{journalist}', sub: '{outlet}, messagerie directe',
          context: [
            'Rôle : journaliste financière, publie à 15 h 00.',
            'Sait : 50 dossiers publiés, panne d’authentification, rançon évoquée.',
            'Objectif : une citation attribuable à un collaborateur.',
            'Levier : « tout le monde parle déjà ».',
            'Ton : cordial, rapide, chaque mot peut être cité.',
          ],
          opening: 'Bonjour, {journalist}, {outlet}. Je sais que la journée est compliquée chez vous. En deux mots, hors micro : c’est aussi grave qu’on le dit ?',
          quick: ['Je ne suis pas habilité à répondre.', 'Hors micro, c’est tendu.', 'Contactez notre service de presse.'],
          rules: [
            { re: 'habilit|pas autoris|service de presse|communication|porte-parole|cellule|crise', replies: ['C’est noté. Votre service de presse ne répond pas, c’est bien pour cela que je vous écris. Une phrase suffirait.', 'Entendu. Je mentionnerai que les collaborateurs ont pour consigne de ne pas parler.'] },
            { re: 'hors micro|entre nous|tendu|grave|panique|oui|compliqu', replies: ['« Tendu ». Merci. Je peux écrire « selon un collaborateur de la banque » ?', 'Je comprends. Et la rançon, vous en avez entendu parler en interne ?'] },
            { re: 'non|pas de comment|aucun comment', replies: ['Aucun commentaire, donc. Je publie à quinze heures.'] },
          ],
          fallback: ['Je ne vous citerai pas nommément. Dites-moi simplement si les clients sont prévenus.', 'Vos collègues m’ont déjà répondu, vous savez.', 'Une dernière chose : vous pouvez encore vous connecter, vous ?'],
        },
      ],
    },
  ],

  /* ---------- 3. Dispositif ---------- */
  dispositif: {
    title: 'Trois temps, trois niveaux',
    lead: 'Chaque incident est unique, chaque banque aussi. Une crise cyber va vite, sans structure, sur tous les fronts à la fois. L’exercice se construit donc à partir de vos menaces, pas d’un scénario de catalogue.',
    phases: [
      { name: 'Préparation', points: ['Comprendre le paysage actuel des menaces.', 'Analyser et hiérarchiser les vecteurs propres à votre établissement.', 'Écrire les scénarios et les injects à partir de ces vecteurs.'] },
      { name: 'Simulation', points: ['L’exercice suit vos scénarios de menace prioritaires.', 'Une demi-journée couvre deux à trois jours d’incident réel.', 'Trois niveaux, selon l’équipe que vous voulez éprouver.'] },
      { name: 'Restitution', points: ['Un rapport d’observations pour combler les écarts constatés.', 'Une évaluation indépendante et un étalonnage face à vos pairs.', 'Une base pour que la direction arrête sa stratégie d’incident cyber.'] },
    ],
    levelsTitle: 'Quel niveau jouer',
    levels: [
      { tag: 'Niveau 1', name: 'Équipe de réponse à incident', format: 'Exercice sur table',
        focus: 'Met à l’épreuve le coordinateur d’incident et son équipe pendant qu’ils déroulent leur plan de réponse.',
        audience: 'CTO, CIO, CISO, coordinateur d’incident, responsables des équipes de réponse, BCM',
        injects: ['messages', 'call', 'agent'] },
      { tag: 'Niveau 2', name: 'Direction générale', format: 'Exercice sur table',
        focus: 'Centré sur la prise de décision pendant l’incident : payer, annoncer, communiquer, couper.',
        audience: 'CEO, COO, CFO, CTO, CIO, CISO, General Counsel, communication, RH, responsables métiers et IT',
        injects: ['fakenews', 'call', 'voice', 'deepfake'] },
      { tag: 'Niveau 3', name: 'Équipe technique', format: 'Exercice technique',
        focus: 'Éprouve la capacité de l’organisation à détecter des attaquants avancés et à y répondre.',
        audience: 'CISO, coordinateur d’incident, responsable des investigations, techniciens et opérations',
        injects: ['messages', 'agent'] },
    ],
    processTitle: 'Le cycle de réponse que l’exercice parcourt',
    process: ['Préparer', 'Identifier', 'Contenir', 'Investiguer', 'Remédier', 'Suivre'],
  },

  /* ---------- 4. Pourquoi ---------- */
  pourquoi: {
    title: 'Un exercice que l’on subit, pas que l’on lit',
    lead: 'Dans un exercice classique, un animateur lit une carte : « un journaliste vous appelle ». Ici, le téléphone sonne.',
    compareHead: ['', 'Exercice sur table classique', 'Injects de nouvelle génération'],
    compare: [
      ['Support', 'Cartes papier, diapositives', 'Appels, messages, articles, voix et vidéos sur les vrais canaux'],
      ['Pression', 'Un événement à la fois, lu à voix haute', 'Plusieurs fronts en même temps, en temps réel'],
      ['Sur mesure', 'Scénario de catalogue', 'Vos noms, vos outils, votre place financière'],
      ['Mesure', 'Impressions de l’animateur', 'Chaque décision horodatée, comparée à vos pairs'],
      ['Mémoire', 'On se souvient d’avoir discuté', 'On se souvient d’avoir décroché'],
    ],
    valuesTitle: 'Ce qui compte pour une banque privée',
    values: [
      { name: 'Discret', text: 'Périmètre restreint, données fictives, accord de confidentialité. Rien ne sort de la salle, rien ne touche vos clients.' },
      { name: 'Réaliste', text: 'Les techniques sont celles des attaquants d’aujourd’hui : voix clonée, vidéo générée, interlocuteurs qui répondent.' },
      { name: 'Mesurable', text: 'Délais de réaction, décisions, informations lâchées : la régie enregistre tout, le rapport s’appuie sur des faits.' },
      { name: 'Sans risque', text: 'Chaque contenu porte la mention « exercice ». Aucun système de production n’est touché.' },
    ],
    benefitsTitle: 'Ce que votre équipe en retire',
    benefits: [
      'Un plan de réponse amélioré, côté personnes, processus et technologie.',
      'Des rôles, des protocoles, des circuits de communication et d’escalade clarifiés.',
      'Des réflexes : en crise réelle, une routine apprise rend les actions plus efficaces.',
      'Une équipe prête, qui l’aura « déjà fait » ensemble.',
      'Des faiblesses de processus ou techniques mises au jour, y compris dans la documentation de réponse.',
    ],
  },

  /* ---------- 5. Contact ---------- */
  contact: {
    title: 'Parlons de votre prochaine crise',
    lead: 'Un premier échange de trente minutes, sous accord de confidentialité. Nous repartons avec vos trois scénarios prioritaires, vous avec un format et un calendrier.',
    // PLACEHOLDER — adresse qui reçoit les demandes (ouvre le client mail du visiteur).
    email: 'contact@votre-cabinet.example',
    // PLACEHOLDER — autres coordonnées, ou tableau vide.
    lines: [
      { label: 'Téléphone', value: '+41 22 000 00 00' },
      { label: 'Lieu', value: 'Genève' },
    ],
    steps: ['Échange confidentiel de 30 minutes', 'Cadrage : menaces, niveau, participants', 'Exercice en vos murs, restitution sous dix jours'],
    fields: { name: 'Nom', bank: 'Établissement', role: 'Fonction', email: 'E-mail professionnel', level: 'Niveau envisagé', message: 'Ce que vous voulez éprouver' },
    levelOptions: ['À définir ensemble', 'Niveau 1 — équipe de réponse', 'Niveau 2 — direction générale', 'Niveau 3 — équipe technique'],
    submit: 'Demander un échange confidentiel',
    sent: 'Demande prête dans votre messagerie. Envoyez-la pour nous la transmettre.',
    note: 'Rien n’est transmis par ce site : le formulaire prépare un e-mail que vous envoyez vous-même.',
  },
};
