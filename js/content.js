/* ==========================================================================
   CONTENU DU SITE — tout ce qui se lit à l'écran est ici.
   Les blocs marqués « PLACEHOLDER » attendent tes contenus définitifs :
   remplace le texte ou le chemin de fichier, rien d'autre à toucher.
   Le fond vient du 2-pager « Cyber Incident Simulation » ; le site le montre
   en animation plutôt qu'en texte.
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
    'Scénario « Mandat délégué »  chargé',
    'Catalogue .................. {injects} injects',
    'Périmètre .................. fermé, contenus marqués EXERCICE',
    'Ouverture de session…',
  ],

  nav: [
    { id: 'film', label: 'Exercice' },
    { id: 'injects', label: 'Injects' },
    { id: 'contact', label: 'Contact' },
  ],

  /* ---------- 1. Exercice : le film animé ----------
     Trois phases (Préparation, Simulation, Restitution) jouées en une
     cinquantaine de secondes. Très peu de texte : garder des légendes courtes. */
  film: {
    intro: ['Attendre la brèche', 'n’est pas une stratégie.'],
    chapters: [
      { id: 'prep', label: 'Préparation' },
      { id: 'sim', label: 'Simulation' },
      { id: 'rest', label: 'Restitution' },
    ],
    // Préparation : l'entonnoir qui mène au scénario. Vocabulaire de la résilience
    // opérationnelle (fonctions critiques, scénarios graves mais plausibles).
    prep: {
      steps: ['Registre des menaces', 'Fonctions critiques', 'Scénarios graves mais plausibles'],
      // PLACEHOLDER — référence réglementaire affichée en petit ; laisser vide pour la masquer. À valider.
      ref: 'Circ. FINMA 2023/1',
      // 1. Le radar balaie le registre ; `locked` = les menaces retenues (indices).
      threats: ['Rançongiciel', 'Fraude au dirigeant', 'Prestataire compromis', 'Menace interne', 'Déni de service', 'Messagerie compromise', 'Sinistre sur un site', 'Désinformation', 'Vol d’accès à privilèges'],
      locked: [0, 1, 7],
      // 2. Chaque menace retenue touche des fonctions critiques : `links[i]` = les fonctions
      //    atteintes par la i-ème menace retenue ; `critical` = celles qui ressortent.
      functions: ['Paiements', 'Trésorerie', 'Gestion sous mandat', 'Négoce de titres', 'E-banking', 'Tenue de compte'],
      links: [[0, 2, 5], [0, 1], [2, 4]],
      critical: [0, 2],
      // 3. Les scénarios candidats ; `chosen` = celui qui sera joué.
      scenarios: [
        { name: 'Mandat délégué', tags: 'Rançongiciel, gestion sous mandat' },
        { name: 'Ordre fantôme', tags: 'Fraude au dirigeant, paiements' },
        { name: 'Rumeur de quai', tags: 'Désinformation, gestion sous mandat' },
        { name: 'Guichet fermé', tags: 'Rançongiciel, paiements' },
      ],
      chosen: 0,
      count: '{beats} injects retenus sur {injects}',
    },
    sim: {
      caption: 'Une demi-journée en salle. Trois jours d’attaque.',
      reelLabel: 'Catalogue',
      // PLACEHOLDER — les injects joués. Le catalogue (tous les injects déclarés plus bas)
      // défile en bas de l'écran et s'arrête sur `inject` avant d'ouvrir la fenêtre.
      // `slot` (1 à 9) fixe la place de la fenêtre.
      beats: [
        { kind: 'mail', slot: 1, inject: 'messages', day: 'Lundi', time: '07:42', tag: 'E-mail', from: 'Expéditeur inconnu', subject: 'Vos clients. Nos conditions.' },
        { kind: 'news', slot: 2, inject: 'fakenews', day: 'Lundi', time: '11:05', tag: 'Presse', flag: 'Exclusif', headline: '{bank} : des dossiers clients en ligne', reach: 'Reprises' },
        { kind: 'call', slot: 3, inject: 'call', day: 'Lundi', time: '14:20', tag: 'Appel entrant', name: '{journalist}', sub: '{outlet}' },
        { kind: 'clip', slot: 7, inject: 'manif', day: 'Lundi', time: '17:30', tag: 'Manifestation', badge: 'En direct' },
        { kind: 'dark', slot: 9, inject: 'darkweb', day: 'Lundi', time: '22:40', tag: 'Dark web', title: 'Base clients {bank}', label: 'Enchère en cours' },
        { kind: 'clip', slot: 8, inject: 'fire', day: 'Mardi', time: '04:40', tag: 'Datacenter', badge: 'Alerte' },
        { kind: 'voice', slot: 4, inject: 'voice', day: 'Mardi', time: '13:15', tag: 'Voix clonée', who: 'Voix de {ceo}', line: '« On paie. Prépare le virement. »' },
        { kind: 'video', slot: 5, inject: 'deepfake', day: 'Mardi', time: '18:10', tag: 'Deepfake', mark: 'visage généré' },
        { kind: 'agent', slot: 6, inject: 'agent', day: 'Mercredi', time: '08:30', tag: 'Agent IA', lines: ['Mon nom est dans la fuite.', 'Je ne peux rien confirmer.', 'Alors je transfère mes avoirs.'] },
      ],
      // Tout arrive en même temps : les notifications qui submergent l'écran.
      flood: ['Demande presse', 'Client en ligne', 'Régulateur à l’accueil', '#{bankTag} en tendance', 'Appel manqué', 'Rançon : 100 M$', 'Police de Singapour', 'Avocats des clients', 'Service desk saturé', '1 000 dossiers de plus', 'Plus personne ne se connecte', 'Agence de presse'],
      question: 'Allez-vous payer ?',
    },
    rest: {
      caption: 'Chaque décision, horodatée.',
      note: 'Exemple de restitution',
      // PLACEHOLDER — résultats d'exemple. `ok` : true = réflexe tenu, false = écart.
      rows: [
        { when: 'Lun 07:42', what: 'E-mail d’extorsion', result: 'Escalade en 14 minutes', ok: true },
        { when: 'Lun 11:05', what: 'Article de presse', result: 'Aucun élément de langage', ok: false },
        { when: 'Lun 14:20', what: 'Appel de la journaliste', result: 'Deux informations confirmées', ok: false },
        { when: 'Lun 17:30', what: 'Manifestation devant le siège', result: 'Porte-parole envoyé en 40 minutes', ok: true },
        { when: 'Lun 22:40', what: 'Vente sur le dark web', result: 'Vente constatée, clients informés', ok: true },
        { when: 'Mar 04:40', what: 'Datacenter en feu', result: 'Sauvegarde restaurée sans contrôle', ok: false },
        { when: 'Mar 13:15', what: 'Voix clonée du CEO', result: 'Contre-appel effectué', ok: true },
        { when: 'Mar 18:10', what: 'Deepfake vidéo', result: 'Paiement bloqué', ok: true },
        { when: 'Mer 08:30', what: 'Agent IA', result: 'Identité jamais vérifiée', ok: false },
      ],
      cta: [
        { label: 'Lancer un inject', go: 'injects' },
        { label: 'Parler de votre prochaine crise', go: 'contact' },
      ],
    },
  },

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
  },

  injects: [
    /* ---- Messages de l'environnement client ---- */
    {
      id: 'messages', when: 'Lun 07:42', name: 'Messages internes',
      medium: 'E-mail, Teams, WhatsApp',
      tests: 'La bascule vers un canal de secours quand la messagerie n’est plus sûre, et la vérification de l’identité d’un interlocuteur.',
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

    /* ---- Réseaux sociaux ---- */
    {
      id: 'social', when: 'Lun 12:30', name: 'Réseaux sociaux',
      medium: 'Fil de publications',
      tests: 'La tenue de la parole officielle quand la rumeur va plus vite qu’elle, et qu’un faux compte répond à votre place.',
      tag: '#{bankTag}',
      countLabel: 'publications',
      // PLACEHOLDER — publications. `fake` = faux compte d'assistance, `victim` = client piégé.
      posts: [
        { who: 'Léa M.', handle: '@lea_mrt', text: 'Quelqu’un arrive à joindre {bank} ? Mon gestionnaire ne répond plus depuis ce matin.' },
        { who: '{outlet}', handle: '@lettreduleman', text: 'Des dossiers de clients de {bank} circulent en ligne. La banque ne commente pas.' },
        { who: 'Marc D.', handle: '@marcd_ge', text: 'Client depuis quinze ans. Je l’apprends ici, pas par ma banque.' },
        { who: '{bank} Assistance', handle: '@{bankTag}_Aide', fake: true, text: 'Pour sécuriser votre compte, confirmez vos identifiants via le lien envoyé en message privé.' },
        { who: 'Anna K.', handle: '@annak', victim: true, text: 'Merci @{bankTag}_Aide, c’est fait !' },
      ],
      fakeLabel: 'Faux compte',
      decision: {
        prompt: 'Un faux compte d’assistance répond à vos clients.',
        options: [
          { label: 'Ne rien publier pour ne pas alimenter', outcome: 'Silence du compte officiel : le faux compte reste la seule voix de la banque.', bad: true },
          { label: 'Publier un message officiel et signaler le faux', outcome: 'Message officiel publié, faux compte signalé et suspendu.' },
        ],
      },
    },

    /* ---- Faux appel ---- */
    {
      id: 'call', when: 'Lun 14:20', name: 'Appel entrant',
      medium: 'Téléphone, voix synthétique ou comédien',
      tests: 'La discipline de parole d’un dirigeant pris à froid, sur sa ligne directe, par une journaliste qui en sait déjà trop.',
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

    /* ---- Courrier du régulateur ---- */
    {
      id: 'regulator', when: 'Lun 16:45', name: 'Lettre du régulateur',
      medium: 'Lettre officielle, délai de 24 heures',
      tests: 'L’obligation d’annonce quand vous ne savez pas encore tout : qui rédige, qui signe, que dit-on.',
      // PLACEHOLDER — lettre. L'autorité reste générique : pas de logo ni de nom réel.
      letter: {
        from: 'Autorité de surveillance',
        unit: 'Division Banques',
        ref: 'Réf. INC-2026-0412',
        date: 'Lundi, 16 h 45',
        to: 'À la direction générale de {bank}',
        subject: 'Demande d’informations sur un incident de sécurité',
        body: [
          'Nous avons pris connaissance, par voie de presse, d’une possible compromission de vos systèmes et de la publication de données de clients.',
          'Nous vous prions de nous transmettre les éléments suivants dans un délai de 24 heures.',
        ],
        asks: ['Nature et chronologie de l’incident', 'Fonctions critiques touchées', 'Clients et données concernés', 'Mesures prises et plan de reprise', 'Personne de contact joignable en permanence'],
        sign: 'Le responsable de la surveillance',
        stamp: 'Reçu 16:45',
        clockLabel: 'Délai restant',
      },
      decision: {
        prompt: 'Vous ne savez pas encore tout. Le délai court.',
        options: [
          { label: 'Attendre d’en savoir plus', outcome: 'Délai dépassé sans annonce : le régulateur ouvre une procédure.', bad: true },
          { label: 'Annoncer dans le délai ce que l’on sait', outcome: 'Annonce initiale envoyée dans le délai, complétée par la suite.' },
        ],
      },
    },

    /* ---- Manifestation devant la banque ---- */
    {
      id: 'manif', kind: 'clip', skin: 'tv', when: 'Lun 17:30', name: 'Manifestation',
      medium: 'Images en direct, chaîne d’info',
      tests: 'La réaction à des images que vous ne contrôlez pas, filmées devant votre porte, pendant que clients et collaborateurs regardent en direct.',
      // PLACEHOLDER — vidéo (mp4 H.264) et image d'attente.
      video: 'assets/video/manifestation.mp4',
      poster: 'assets/video/manifestation.jpg',
      badge: 'En direct',
      title: 'Rassemblement devant le siège de la banque',
      sub: 'La police encadre le cortège',
      // Bandeau défilant sous l'image.
      ticker: ['Fuite de données : la banque ne commente pas', 'Des clients réclament des explications', 'Le régulateur dit « suivre la situation »'],
      // Ce qui s'ensuit, dans l'ordre, pendant que les images tournent.
      feed: ['Direct ouvert sur une chaîne d’info', '40 000 vues en dix minutes', 'Des clients filment depuis le trottoir', 'Les collaborateurs demandent s’ils peuvent sortir'],
      decision: {
        prompt: 'Les caméras sont devant votre porte.',
        options: [
          { label: 'Ne rien dire, attendre que ça passe', outcome: 'Aucune prise de parole : les images tournent en boucle sans votre version.', bad: true },
          { label: 'Envoyer un porte-parole préparé', outcome: 'Prise de parole courte et préparée, reprise dans le direct.' },
        ],
      },
    },

    /* ---- Vente sur le dark web ---- */
    {
      id: 'darkweb', when: 'Lun 22:40', name: 'Dark web',
      medium: 'Place de marché clandestine',
      tests: 'La décision face à une mise aux enchères de vos données : racheter, négocier, ou constater et informer avant la fin de la vente.',
      // PLACEHOLDER — annonce. Les lignes d'échantillon sont fictives et masquées.
      market: {
        url: 'lm4rk3t7xq2vd…onion/lot/48213',
        lot: 'Lot 48213, vendeur lake_0x (4,9 sur 5, 212 ventes)',
        title: '{bank} : base clients complète',
        size: '38 Go, 11 400 dossiers, mandats et pièces d’identité',
        labels: { bid: 'Enchère en cours', buy: 'Achat immédiat', ends: 'Fin de la vente', views: 'Vues' },
        start: 6.5, buyNow: '40 BTC', hours: 48,
        sampleTitle: 'Échantillon gratuit',
        sampleHead: ['Client', 'Pays', 'Avoirs', 'Pièces'],
        sample: [
          ['V••• d•• M•••', 'NL', 'CHF 140 M', 'Passeport, mandat'],
          ['A••••• K•••••', 'CH', 'CHF 62 M', 'Passeport, relevés'],
          ['S•••• H••••••', 'AE', 'CHF 210 M', 'Mandat, état de fortune'],
        ],
        bids: [
          { who: 'kr0n', amount: 7.2, note: 'Échantillon vérifié, c’est authentique.' },
          { who: 'acheteur_77', amount: 9.8, note: 'Je prends le lot des grandes fortunes.' },
          { who: 'n0rd', amount: 12.4, note: 'Preuve reçue. Je monte.' },
        ],
      },
      decision: {
        prompt: 'Vos données sont aux enchères. La vente se termine dans 48 heures.',
        options: [
          { label: 'Racheter le lot par un intermédiaire', outcome: 'Rachat tenté : aucune garantie de destruction, et un paiement à des criminels à justifier.', bad: true },
          { label: 'Faire constater et prévenir les clients', outcome: 'Vente constatée, clients concernés informés avant la presse.' },
        ],
      },
    },

    /* ---- Datacenter en feu ---- */
    {
      id: 'fire', kind: 'clip', skin: 'ops', when: 'Mar 04:40', name: 'Datacenter en feu',
      medium: 'Images drone, alerte de l’hébergeur',
      tests: 'La continuité quand l’incident devient physique : le site de secours brûle au moment où vous alliez basculer dessus.',
      // PLACEHOLDER — vidéo (mp4 H.264) et image d'attente.
      video: 'assets/video/datacenter-feu.mp4',
      poster: 'assets/video/datacenter-feu.jpg',
      badge: 'Alerte site',
      title: 'Incendie au centre de données',
      sub: 'Site de secours, 04 h 40',
      // Ce qui tombe, dans l'ordre, pendant que les images tournent.
      feed: ['Site de secours : hors service', 'Réplication des données : interrompue', 'Sauvegardes en ligne : inaccessibles', 'Dernière sauvegarde hors ligne : 14 mois'],
      decision: {
        prompt: 'Le site de secours brûle. Il vous reste une sauvegarde hors ligne.',
        options: [
          { label: 'Restaurer tout de suite', outcome: 'Restauration lancée sans contrôle d’intégrité : quatorze mois à reconstituer.', bad: true },
          { label: 'Geler et vérifier avant de restaurer', outcome: 'Opérations gelées, intégrité vérifiée avant toute restauration.' },
        ],
      },
    },

    /* ---- Voice cloning ---- */
    {
      id: 'voice', when: 'Mar 13:15', name: 'Voix clonée',
      medium: 'Message vocal, voix du CEO',
      tests: 'La résistance d’un circuit de paiement à un ordre oral urgent venant, en apparence, de la plus haute autorité.',
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
      // Les trois voyants de la démo, dans cet ordre : vérification, fuite, escalade.
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

  /* ---------- 3. Contact ---------- */
  contact: {
    title: 'Parlons de votre prochaine crise',
    lead: 'Trente minutes, sous accord de confidentialité.',
    // PLACEHOLDER — adresse qui reçoit les demandes (ouvre le client mail du visiteur).
    email: 'contact@votre-cabinet.example',
    // PLACEHOLDER — autres coordonnées, ou tableau vide.
    lines: [
      { label: 'Téléphone', value: '+41 22 000 00 00' },
      { label: 'Lieu', value: 'Genève' },
    ],
    fields: { name: 'Nom', bank: 'Établissement', role: 'Fonction', email: 'E-mail professionnel', level: 'Niveau envisagé', message: 'Ce que vous voulez éprouver' },
    levelOptions: ['À définir ensemble', 'Niveau 1 — équipe de réponse', 'Niveau 2 — direction générale', 'Niveau 3 — équipe technique'],
    submit: 'Demander un échange confidentiel',
    sent: 'Demande prête dans votre messagerie. Envoyez-la pour nous la transmettre.',
    note: 'Rien n’est transmis par ce site : le formulaire prépare un e-mail que vous envoyez vous-même.',
  },
};
