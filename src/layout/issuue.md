Categories/Featured (src/components/landing/UspStrip.vue:1-85, CategoriesPreview.vue:1-124, FeaturedProductsPreview.vue:1-120)
sont statiques. Pour fluidifier l’onboarding, branche ces widgets sur les vraies données (/client/products, /client/categories) et expose un carrousel
horizontal plutôt qu’un scroll long : on réduit le temps de recherche et on donne des preuves sociales (badges « best sellers », « back in stock »).

Recherche & Navigation catalogue

- src/views/client/Catalog.vue:1-200 montre un filtre basique (catégories fixes kids/women/men). Connecte-le aux catégories remontées par l’API
  (product.category) pour offrir un filtrage dynamique, ajoute des badges « en promo », et surtout mémorise les filtres dans l’URL (useRoute().query)
  pour que chaque retour sur la boutique respecte l’état précédent.
- Le composable useClientProducts (src/composables/client/useClientProducts.js:1-60) n’expose ni recherche textuelle ni count par filtre. Ajoute
  un champ de recherche plein texte, et renvoie un filters objet depuis l’API (ex : fourchettes de prix, tailles). Permets aussi de sauvegarder une
  sélection dans le compte client pour refaire un achat rapide.

Fiche produit & panier

- src/views/client/Product.vue:1-160 gère la taille via SelectButton mais ne l’utilise pas lors de l’ajout (ligne 60 :
  cartStore.addItem(product.value…)). Rattache la taille choisie à l’article (sinon l’acheteur ne sait pas quelle taille il a mise). Tu peux également
  afficher des recommandations « produits associés » en bas en combinant categoryKey ou tags.
- Dans src/views/client/Cart.vue:1-100, chaque carte nécessite un clic pour modifier la quantité. Ajoute des actions rapides : un badge « enregistrer
  pour plus tard », un rappel du stock restant (en interrogeant /client/products/:slug). Ajoute un mini-récap du panier directement dans le topbar pour
  réduire les allers/retours.

Checkout & réduction de friction

- src/views/client/Checkout.vue:1-176 demande toutes les infos même pour un client authentifié. Pré-remplis customerForm avec
  clientProfileStore.profile (si connecté) afin qu’il ne retape pas ses données. Ajoute un indicateur d’étape (ex : Information → Livraison → Paiement)
  pour rassurer. Enfin, useClientCheckout (src/composables/client/useClientCheckout.js:1-69) n’accepte qu’un paiement « cod » : expose un sélecteur (CB,
  PayPal, etc.) et branche ça côté backend pour améliorer la conversion.
- Prévois une validation d’adresse en direct (API type Google Places) pour limiter les erreurs avant la soumission.

Espace compte & réactivation

- src/components/client/ClientProfilePanel.vue:1-178 et src/components/client/ClientOrdersPanel.vue:1-220 pourraient afficher des suggestions post-
  achat : par ex. dans le Tableau de bord, ajoute un bloc « recommandés pour vous » basé sur l’historique (clientOrdersStore.orders). Ajoute aussi un
  suivi de statut plus explicite (ICônes pour « en préparation », « expédié »), car aujourd’hui le statut brut (order.status) n’est pas expliqué.
- Dans src/views/client/account/OrderDetail.vue:1-160, propose des actions post-livraison (ré-achat, demande de retour) pour prolonger le parcours. Tu
  peux ajouter un bouton « Commander de nouveau » qui réinjecte les items dans le panier, et un lien vers une FAQ contextualisée selon le statut.

Back → Front cohérence

- Backend app/Http/Controllers/Api/Client/ClientOrdersController.php:13-61 ne renvoie pas les états enrichis (dates formatées, shipping info). Ajoute
  status_label, delivery_eta, ou tracking_url pour que le front n’ait pas à deviner les libellés. Expose aussi un endpoint GET /client/recommendations
  utilisant l’historique ($customer->orders()) pour alimenter la personnalisation sur la landing/catalogue.

En suivant ces optimisations (CTA contextualisés, filtres dynamiques, pré-remplissage des formulaires, recommandations et actions post-achat), tu
réduis les frictions entre découverte, exploration, achat et fidélisation, tout en exploitant mieux les données déjà présentes dans ton backend/front.

▌ je voudrais que tu me créer un issue pour fixer

> Voici un ticket prêt à déposer :

———

Titre
Optimiser le parcours utilisateur (landing → boutique → commande → compte)

Description
Plusieurs points ralentissent le parcours client :

1. Landing peu orientée conversion
    - Les sections Topbar/Hero/Collections/Featured affichent des CTA génériques vers la boutique. Aucun lien direct n’ouvre le catalogue filtré (ex :
      clic « Femme » → section Femme).
    - Pas de preuve sociale (badges « best seller », « back in stock »), ni de lien rapide vers les fiches déjà consultées.
2. Catalogue & recherche limités (src/views/client/Catalog.vue, useClientProducts)
    - Filtre catégories codé en dur (kids/women/men) alors que les catégories réelles existent côté API.
    - Pas de recherche texte, pas de persistance des filtres dans l’URL, ni de suggestion automatique.
3. Fiche produit/panier (src/views/client/Product.vue, src/views/client/Cart.vue)
    - Taille sélectionnée non transmise au panier.
    - Pas de recommandations complémentaires ni de mini-panier accessible depuis la topbar.
4. Checkout (src/views/client/Checkout.vue, useClientCheckout)
    - Champs non pré-remplis pour un client connecté (profil non réutilisé).
    - Un seul mode de paiement (cod) et aucune indication d’étapes.
5. Espace compte (ClientProfilePanel, ClientOrdersPanel, OrderDetail)
    - Pas de recommandations post-achat ni d’actions rapides (« commander à nouveau », « suivre la livraison »).
    - Statuts de commande peu explicites (manque de libellés, d’icônes, de tracking).

Objectif
Améliorer le tunnel en :

- Ajoutant des CTA contextuels et filtres dynamiques sur la landing/catalogue.
- Pré-remplissant le checkout, en diversifiant les paiements, ajoutant des indicateurs d’étapes.
- Enrichissant le compte client (statuts lisibles, re-order, recommandations).
- Propager les métadonnées nécessaires côté API (libellés de statut, recommandations).

Livrables

- Nouvelle UX pour les sections landing & catalogue (CTA directs + filtres dynamiques + recherche).
- Mise à jour du panier/checkout pour exploiter les infos profil et modes de paiement multiples.
- Fonctionnalités de re-engagement dans l’espace client (re-order, suivi, suggestions).
- Ajustements API nécessaires (statuts, tracking, recommandations).

———

Tu peux adapter les détails techniques selon les priorités (roadmap produit).

