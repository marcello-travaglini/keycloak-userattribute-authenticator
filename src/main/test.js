/**
 * Created with JetBrains WebStorm.
 * User: AlmavivA.Spa
 * Date: 13/04/18
 * Time: 10.00
 * To change this template use File | Settings | File Templates.
 */
app.views.buyTicketless = app.views.base.extend({
    source: "app.views.buyTicketless",

    card : {},
    contractsOnCard : {},
    selectedContract : {},
    faresToBuy : {},
    selectedOffer : {},
    connectionList : {},
    rate : {},
    retPost : {},
    isPostOK : true,
    iniper : null,
    contractSaved : null,
    datinicntMin : null,
    offerOdSelected : {},
    gruppiMusei : null,
    accessRead : {"numtan":-1, "data": null},
    // Tipologia biglietti e selezionato
    tickets_type: null,
    tickets_type_selected: null,
    // Musei e museo selezionato
    museums: null,
    museum_selected : null,
    // Percorsi e percorso selezionato
    routes: null,
    route_selected: null,
    // Data e percorso selezionato
    day_selected: null,
    track_selected: null,

    /** init view **/
    initialize: function () {
        app.class.logger.app.log(app.class.logger.app.level.TRACE, this.source, "app.views.buyOnCard.initialize [OK]");
    },

    /** submit event for login **/
    events: {
        "click #btnCart" : "btnCart",
        'click #hamburger': function () {
            this.sidebarManagement()
        },
        'click #btnBackCard': function () {
            this.redirect('/contracts')
        },
        'click #btnCancel': "deletePanel",
        'click #btnCalculate': "preCalculate",
        'change #datinicntForm': "calculatesEndDateContract",
        'autocompleteChange #codputoriForm': "calculateArrivalPoints",
        'autocompleteChange #codputdsnForm': "calculateConnection",
        'change #codrelodForm': "showConnectionArea",
        'change #codvalspaForm': "changeCodValSpa",
        "click #museumList" : "museumListToggler",
        "click #museumListDiscount" : "museumListDiscountToggler",

        "click #btnReceiptPrintSubmission" : "btnReceiptPrintSubmission",
        "click #btnBuy" : "goPayment",
        "change #odOfferForm" : "changeOdOffer",

        "click #typeTickets":"changeTicketType",
        "change #smartMuseumCod": "changeMuseum",
        "click #museum_card": "changeMuseum",
        "change #dateTicket": "selectedDay",
        "click #btnBack": "backBtn",
        "click #routes_available_card": "loadDates",
        "click #btnTickets":"searchTicket",
        "click #info_tickets": "openModalInfoTickets",
        "click #btnInc":"changeQuantity",
        "click #btnDec":"changeQuantity",
        "click #btnBuyNew":"goPaymentNew"
    },

    /** InitControls **/
    initControls: function () {
        var dfd = new $.Deferred();
        var that = this;
        if (app.global.tokensCollection.first() !== undefined) {
            this.startLoading();
            $.when(that.callApiRestSpatialValidityZone(),
                that.callApiRestGruppiMusei())
                .done(function () {
                    that.initializePage();
                    that.finishLoading();
                    return dfd.resolve();
                })
                .fail(function () {
                    that.finishLoading();
                    dfd.reject();
                });
        }
        return dfd.promise();
    },

    /** render template **/
    render: function () {
        var lang = this.language.lang;

        this.language.server = location.protocol + "//" + location.host + "/scabec/staging";

        $(this.el).html(this.template(this.language));
        $(document).attr('title', app.class.locale.app[lang].interfaceLocal.app_title + ' | ' + lang);

        $("#pageTitle").html("<img src='css/img/scabec/icon-acquistopass.png' width='70px'> " +  this.language.title);

        $(".nav-profile div a span").removeClass("menuSel");
        $("#navbarSale span").addClass("menuSel");
        this.initControls();
        return this;
    },

    /** initialization of html page **/
    initializePage: function () {
        $('#return-to-top').trigger('click');
        this.$('#btnBack').hide();
        this.$('.routes_available').hide();
        this.$('.list_museum').hide();
        //this.initializeDatePicker();
        //this.recoveryTicketsType();        
        this.recoveryMuseums();
        this.updateBadgeTickets();
    },
    /** initialize DatePicker widget **/
    initializeDatePicker: function () {
        var that = this;
        $.datepicker.setDefaults($.datepicker.regional[app.utils.getLanguage()]);

        // -- [ Rinnovo Data da ] --
        this.$('#datinicntForm').datepicker({
            showOn: 'both',
            buttonText: "<i class='far fa-calendar-alt'></i>",
            showAnim: 'show',
            beforeShowDay: function (date) {
                return that.evalInitDate(date, that.iniper);
            }
        });

        //this.$('#datinicntForm').datepicker();

        // -- [ Rinnovo Data a ] --
        this.$('#datfincntForm').datepicker({
            showOn: 'both',
            buttonText: "<i class='far fa-calendar-alt'></i>",
            showAnim: 'show',
            disabled: true
        });

        this.$("#datinicntForm").mask("00/00/0000");
    },
    // Apertura modal info tickets con le diverse tipologie
    openModalInfoTickets: function() {
        this.$("#modalInfoTicket").modal('show');
    },
    // Recupero tipologia di biglietti
    recoveryTicketsType: function(){
        this.$(".dates").hide();
        this.$("#btnBack").hide();
        this.$("#title_sec").text(this.language.selectTicket);
        var response = {
            "data": [
                {"id":"001", "den":"Offerte integrate", "description":"Scopri le offerte", "disabled": true}, // Offerte integrate
                {"id":"002", "den":"Scopri i musei", "description":"Visita il museo che più di affascina", "disabled": false},
            ]
        }
        this.tickets_type = response.data;
        var l = [];
        this.$(".list_tickets_type").find(".ttype").remove();
        $.each(this.tickets_type, function (index, v){
            var target = '<div id="typeTickets" class="ttype w-50 p-3"  data-ticketid="[ticketId]">' + 
                            '<div id="tycket_card" class="ticket_card card h-100 m-4 text-center justify-content-center" style="min-height: 200px; height: auto !important;">' + 
                                '<h5 class="name font-weight-bold">[name]</h5>' + 
                                '<h6 class="details mt-4">[details]</h6>' + 
                            '</div>' + 
                        '</div>';
            target = target.replace("[name]", v.den);
            target = target.replace("[details]", v.description);
            target = target.replace("[ticketId]", v.id);
            l.push(target);
        });
        this.$(".list_tickets_type").find(".row").append(l);
        this.$(".list_tickets_type").find(".row").show();
        this.$(".list_tickets_type").show();
    },
    changeTicketType: function(event){
        var id_type_ticket = $(event.currentTarget).data("ticketid");
        this.tickets_type_selected = this.tickets_type.filter(function(val){
            return val.id == id_type_ticket;
        })[0];
        if(this.tickets_type_selected.disabled){
            alert("Work in progress!");
            return null;
        }
        this.$(".list_tickets_type").hide();
        this.recoveryMuseums();
    },
    // Recupero lista dei musei
    recoveryMuseums: function(){
        var clazz = this;
        this.$(".dates").hide();
        this.$('#btnBack').find("span").text(this.language.btnBackCard);
        this.$("#btnBack").hide();
        this.$("#title_sec").text(this.language.selectMuseum);
        this.$("#modalInfoTicket").find(".modal-body").html(this.language.infoTickets)
        this.$("#museum_name").text("");
        $.ajax({
            type: "GET",
            url: app.const.apiurl() + "museum/all" ,
            dataType: "json",
            success: function (xml) {
                var response =  xml.listaVettori;
                clazz.museums = response;
                var l = [];
                $.each(response, function (index, v){
                    var target = clazz.$(".museum_card").prop("outerHTML");
                    target = target.replace("[name]", v.den);
                    target = target.replace("[details]", v.idr);
                    target = target.replace("[mus_id]", v.codveo);
                    target = target.replace("[mus_name]", v.den);
                    l.push(target);
                })
                clazz.$(".museum_card").parent().append(l);
                clazz.$(".museum_card").first().hide();
                clazz.$(".list_museum").find(".row").show();
                clazz.$(".list_museum").show();
                return true;
            },
            error: function (statusCode) {
                return null;
            }
        });
    },
    /** Cambio Museo */
    changeMuseum: function(event){
        $(".routes_available").hide();
        //var idMuseum = $(event.target).val();
        //var nameMuseum = $(event.target).find("option:selected").text();
        var idMuseum = $(event.currentTarget).data("musid");
        this.museum_selected = this.museums.filter(function(obj){return obj.codveo == idMuseum})[0];
        var clazz = this;
        if(idMuseum != ""){
            //this.loadDates();
            this.loadRoutes();
        }
    },
    // Recupero percorsi disponibile per un determinato museo
    loadRoutes: function(event){
        var dfd = new $.Deferred();
        this.startLoading();
        var clazz = this;
        this.$('#btnBack').find("span").text(this.language.changeMuseum);
        this.$('#btnBack').show();
        this.$("#museum_name").text(this.museum_selected.den);
        this.$("#title_sec").text(this.language.selectVisitType);
        this.$(".routes_available_card:gt(0)").remove();
        $.ajax({
            type: "GET",
            url: app.const.apiurl() + "zone/museum/" +  clazz.museum_selected.codveo ,
            dataType: "json",
            success: function (xml) {
               
                clazz.$(".list_museum").hide();
                var response =  xml.values;
                clazz.routes = xml.values;
                $.each(response, function (index, v){
                    var target = clazz.$(".routes_available_card").prop("outerHTML");
                    target = target.replace("[desoff]", v.nomzon);
                    target = target.replace(new RegExp(/\[ideoff\]/g), v.idezon);
                    target = target.replace(new RegExp(/\[idmuseum\]/g), clazz.museum_selected.codveo);
                    target = target.replace(new RegExp(/\[codvalspa\]/g), v.nomzon);
                    target = target.replace(new RegExp(/\[qtavaltep\]/g), v.nomzon);
                    target = target.replace(new RegExp(/\[route_id\]/g), v.idezon);                    
                    clazz.$(".routes_available_card").parent().append(target);
                    if (v.qtavaltep == 999) {
                        clazz.$("#btnmoreinfo" + v.idezon).html(clazz.language.moreInfo);
                    }
                    clazz.$("#btnmoreinfo" + v.idezon).unbind("click");

                    clazz.$("#btnmoreinfo" + v.idezon).on("click", function(event) {
                        event.stopImmediatePropagation();
                        var idezon = $(this).data("id");
                        var codvalspa = $(this).data("codvalspa");
                        var offertaEvento = $(this).data("qtavaltep");

                        if (offertaEvento == 999) {
                            clazz.openMoreInfo(idezon, codvalspa);
                        } else {
                            clazz.accessMuseum(1, idezon, codvalspa, "notActive");
                        }
                    });
                })
                clazz.$(".routes_available_card").first().hide();
                clazz.$(".routes_available_card:gt(0)").show();
                clazz.$(".routes_available").find(".row").show();
                clazz.$(".routes_available").show();
                //that.salableOffersManagement(xml);
                clazz.faresToBuy = xml.values;
                clazz.finishLoading()
                return dfd.resolve();
            },
            error: function (statusCode) {
                this.$('#btnBack').hide();
                clazz.finishLoading()
                return null;
            }
        });
    },
    loadDates: function(event){   
        var id_Route = $(event.currentTarget).data("routeid");
        this.$("#museum_name").text("");
        this.route_selected = null;
        var clazz = this;
        $.each(this.routes, function(idx, h) {
            if(h.idezon == id_Route){
                clazz.route_selected = h;
            }
        });
        this.$(".routes_available").hide();
        this.$('#btnBack').find("span").text(this.language.changeVisitType);
        $(".dates").show();
        $(".tickets_view").hide();
        this.$('.n_museum').text(this.museum_selected.den);
        this.$('.n_routes').text(this.route_selected.nomzon);
        this.$("#title_sec").text("");
        var dn = new Date();
        dn.setDate(dn.getDate() -1);
        this.$('#dateTicket').prop('min', dn.getFullYear() + "-" + (dn.getMonth() < 9 ? "0" + (dn.getMonth() + 1) : dn.getMonth() + 1)  + "-" +  (dn.getDate() < 9 ? "0" + (dn.getDate() + 1) : dn.getDate() + 1));
        document.getElementById("dateTicket").valueAsDate = new Date()
        this.day_selected = new Date();
        $('.content_museum').hide();
        this.searchTicket();
    },
    selectedDay: function(event) {
        var that = this;
        this.day_selected = new Date($(event.currentTarget).val());
        this.searchTicket();
    },
    searchTicket: function(){
        var that = this;
        var dn = new Date();
        dn.setDate(dn.getDate() -1);
        if(this.day_selected == null || new Date(this.day_selected).getTime() < dn.getTime()){
            alert("Valorizzare correttamente il campo data!");
            return null;
        }
        this.$(".tickets_view").find(".cardTickets").remove();
        $.ajax({
            type: "GET",
            url: app.const.apiurl() + "offer/timeslot?idezon=" + this.route_selected.idezon + "&date=" + this.day_selected.toISOString().slice(0, 10) + "&codveo=" + this.museum_selected.codveo ,
            dataType: "json",
            success: function (xml) {
               console.log(xml);
                var row = that.route_selected;
                console.debug("Percorso selezionato");
                console.debug(row);
                var cart = app.global.tokensCollection.models[0].attributes.cart; 
                console.debug("Carrello");
                console.debug(cart);
                // this.$(".tickets_view").show()
                $.each(xml.offers, function(idx, h) {
                    // legge il template HTML per la scheda con l'offerta
                    var myHtml = '<div class="column card m-3 col-lg-3 cardTickets" style="height: auto;">'
                                    + '<div class="column">'
                                    +   '<div class="column text-center">'
                                    +       '<h5 class="hour">[hour]</h5>'
                                    +       ' [available]'
                                    +   '</div>'
                                    +   '[content]'
                                    +   '<div class="row justify-content-center p-2">'
                                    +       '<button id="btnBuyNew" class="text-white btn btn-new" style="background-color: #D9C756">Aggiungi</button>'
                                    +   '</div>'
                                    +  '</div>'
                                + '</div>';
                    myHtml = myHtml.replace(new RegExp(/\[hour\]/g), h.hour);
                    var list = [];
                    $.each(h.types, function(index, i) {
                        // id: id fascia oraria
                        // ideoff: idOfferta
                        // hour: Orario fascia oraria
                        // idetipcnt: idetipcnt
                        //maxoffvendibiliutente: Massimo biglietti acquistabili
                        var row_type = '<div class="row justify-content-between p-2 infoTicketType d-flex" data-id=\'[id]\' data-ideoff=\'[ideoff]\' data-hour=\'[houroff]\' data-idetipcnt=\'[idetipcnt]\' data-maxoffvendibiliutente=\'[maxOffVendibiliUtente]\'>' +
                                            '<span class="flex-fill infoTicketType_name">[type]</span>' +
                                            '<span class="infoTicketType_price" style="width: 90px; margin-right: 10px;">' +  (i.finalPrice != "0" ? '( [val]€ )' : '') + '</span>' +
                                            '<div class="row text-center inc_dec_tickets">' +
                                                '<button id="btnDec">-</button>' +
                                                '<span class="ml-2 mr-2 quantity">[quantity]</span>' +
                                                '<button id="btnInc">+</button>' +
                                            '</div>' +
                                        '</div>';
                        // sostituisce i valori
                        var quantity = cart.filter(function(o) {
                            return  o.id == h.id      // Stessa fascia oraria
                                    && o.ideoff === h.id + "_" + i.idTicket + "_" + that.route_selected.idezon + "_" + that.museum_selected.codveo // Stessa offerta 
                        })

                        row_type = row_type.replace(new RegExp(/\[quantity\]/g), quantity.length == 0 ? '0' : quantity[0].Counter);
                        row_type = row_type.replace(new RegExp(/\[id\]/g), h.id);
                        row_type = row_type.replace(new RegExp(/\[ideoff\]/g), i.idTicket);
                        row_type = row_type.replace(new RegExp(/\[houroff\]/g), h.hour);
                        row_type = row_type.replace(new RegExp(/\[idetipcnt\]/g), i.idetipcnt);
                        row_type = row_type.replace(new RegExp(/\[maxOffVendibiliUtente\]/g), row.maxOffVendibiliUtente);
                        row_type = row_type.replace(new RegExp(/\[type\]/g), i.label);
                        row_type = row_type.replace(new RegExp(/\[val\]/g), i.finalPrice);
                        list.push(row_type);
                    })
                    myHtml = myHtml.replace("[available]",'<h6 style="color: red; height: 20px;" id="max_ticket_available" data-maxavailable=\''+ h.available  + '\'>' + (h.available < 10 ?  + h.available +' posti disponibili ' : '') + '</h6>');
                    myHtml = myHtml.replace("[content]", list.join(''))
                    // appende il div
                    that.$(".tickets_view").find(".items").append(myHtml);
                });
                that.$(".tickets_view").show()
                that.finishLoading()
                //return dfd.resolve();
            },
            error: function (statusCode) {
                this.$('#btnBack').hide();
                that.finishLoading()
                return null;
            }
        });


        // var that = this;
        
        // var res = {
        //     "result":[
        //         {
        //             "id":"001",
        //             "hour": "09:00-13:00",
        //             "quantity":50,
        //             "available":7,
        //             "types":[
        //                     {"idOffer": 0, "label":"Intero", "price":"12", "final_price":"10", "idetipcnt": 2},
        //                     // {"idOffer": 1, "label":"Ridotto", "price":"1", "final_price":"1", "idetipcnt": 4},
        //                     {"idOffer": 1, "label":"Ridotto", "price":"1", "final_price":"1", "idetipcnt": 2},
        //                     {"idOffer": 2, "label":"Gratuito", "price":"0", "final_price":"0", "idetipcnt": 2}
        //                 ]
        //         },
        //         {
        //             "id":"002",
        //             "hour": "14:00-18:00",
        //             "quantity":50,
        //             "available":7,
        //             "types":[
        //                     {"idOffer": 0, "label":"Intero", "price":"12", "final_price":"10", "idetipcnt": 2},
        //                     {"idOffer": 1, "label":"Ridotto", "price":"1", "final_price":"1", "idetipcnt": 2},
        //                     {"idOffer": 2, "label":"Gratuito", "price":"0", "final_price":"0", "idetipcnt": 2}
        //                 ]
        //         }
        //     ]
        // };

        
    },
    changeQuantity: function(event){
        var val = $(event.currentTarget).parent().find(".quantity").text();
        //var max_quantity = +$(event.currentTarget).parent().parent().data("maxoffvendibiliutente"); // Allo stato è undefined
        var avaiables = +$(event.currentTarget).parent().parent().parent().find("#max_ticket_available").data("maxavailable");

        var tot_tickets = ($.map($(event.currentTarget).parent().parent().parent().parent().find(".quantity"), function(value, index){
                                            return +$(value).text()
                                        }).reduce(function add(a,b){return a+b}, 0));

                    
        switch(event.currentTarget.id){
            case "btnDec":
                if(+val > 0)
                    $(event.currentTarget).parent().find(".quantity").text(+val -1)
                break;
            case "btnInc":
                ((tot_tickets + 1) <= avaiables) 
                    ? $(event.currentTarget).parent().find(".quantity").text(+val +1)
                    : alert("Quantità massima raggiunta!");
                break;
        }
    },
    backBtn: function(){
        if($(".list_museum").is(":visible")){
            $(".list_museum").hide();
            this.recoveryTicketsType();
        } if($(".routes_available").is(":visible")){
            $(".routes_available").hide();
            this.recoveryMuseums();
        } else if($(".dates").is(":visible")){
            $(".dates").hide();
            this.loadRoutes();
        }
    },
    goPaymentNew: function(event){
        // console.debug($(event.currentTarget).parent().parent().parent().find(".infoTicketType"))
        var tickets = [];
        var clazz = this;
        var cart = app.global.tokensCollection.models[0].attributes.cart; 
        var totTickets = cart;
        $.each($(event.currentTarget).parent().parent().parent().find(".infoTicketType"), function(index, value){
            var id = $(value).data("id");
            var idOffer = $(value).data("ideoff");
            var hour = $(value).data("hour");
            var idetipcnt = $(value).data("idetipcnt");
            var quantity = +$(value).find(".quantity").text();
            var price = $(value).find(".infoTicketType_price").text().replace("\(","").replace("\)","").replace("€", "").trim();
            var type = $(value).find(".infoTicketType_name").text();
            totTickets = totTickets.filter(function(o){
                return o.ideoff !=  id + "_" + idOffer + "_" + clazz.route_selected.idezon + "_" + clazz.museum_selected.codveo
            });
            if(+quantity > 0){
                //var n = tickets.filter(function(value, idx){return value.id == clazz.route_selected.idezon}).length;
                //var id = (n == 0 ? clazz.route_selected.idezon : clazz.route_selected.idezon + (n * 10));                
                tickets.push({
                    id: id,
                    unique_id:  id + "_" + idOffer + "_" + clazz.route_selected.idezon + "_" + clazz.museum_selected.codveo,
                    idoff: idOffer, 
                    quantity: quantity, 
                    hour: hour, 
                    price: price != '' ? +price : 0,
                    type: type, 
                    idetipcnt: idetipcnt
                });
            }
        });
        console.debug(tickets)
        console.debug(cart);
        
        $.each(tickets, function(index, ticket){
            // Ricerca offerta selezionata
            var cartTicket = {
                id: ticket.id,
                ideoff: ticket.unique_id, //offertaSel.idezon + (index * 10),
                idmuseum:  clazz.museum_selected.codveo,
                idroute: clazz.route_selected.idezon,
                idoff: ticket.idoff,
                day: new Date(clazz.day_selected).toISOString(),
                hour: ticket.hour,
                museum_den: clazz.museum_selected.den,
                route_den: clazz.route_selected.nomzon,
                ticket_type: ticket.type,
                pzz: ticket.price,
                maxOffVendibiliUtente: 10,
                Counter: ticket.quantity,
                pzzTot: ticket.price * ticket.quantity,
                idetipcnt: ticket.idetipcnt
            }
            totTickets.push(cartTicket);
            
        })
        console.debug(totTickets);
        console.debug(cart);
        // $.each(totTickets, function(index, ticket){cart.push(ticket)});
        app.global.tokensCollection.models[0].attributes.cart = totTickets;
        //app.global.tokensCollection.models[0].attributes.cart = []
        app.global.tokensCollection.models[0].save();
        app.global.views.headerMyProfile.updateCart();
        clazz.updateBadgeTickets();
        console.debug(cart);
        // var maxoffvendibiliutente = $(this).data("maxoffvendibiliutente");
        // var pzz = $(this).data("finalpzz");
        

        // var cart = app.global.tokensCollection.models[0].attributes.cart;

        // var offertaCart = cart.filter(function(row, index) {
        //     if (row.ideoff == sel) {
        //         if (!(maxoffvendibiliutente != "null" && row.Counter >= parseInt(maxoffvendibiliutente))) {
        //             row.Counter++;
        //             row.pzzTot += pzz;
        //         }
        //     }
        //     return row.ideoff == sel;
        // });

        // if (offertaCart.length == 0) {
        //     cart.push(offertaSel[0]);
        //     cart[cart.length - 1].Counter = 1;
        //     cart[cart.length - 1].pzzTot = cart[cart.length - 1].pzz;
        //     app.global.tokensCollection.models[0].save();
        // }

        // var qtaTot = 0;
        // var pzzTot = 0;
        // cart.filter(function(row, index) {
        //     qtaTot += row.Counter;
        //     pzzTot += row.pzzTot;
        //     app.global.tokensCollection.models[0].save();
        // })
        // that.updateBadgeTickets();
        // app.global.views.headerMyProfile.updateCart();
    },
    //-------------------------------------------
    /** implements table, contracts on card **/
    contractsOnCardManagement: function() {

        // Esclude i contratti annullati
        var contracts = this.contractsOnCard.filter(function(item) {
            return item.datanuvda === null;
        });

        // Sorta i contratti per offerta, validita spaziale, relazione OD, data fine contratto (discendente)
        //contracts.sort(this.contractsSort);

        // Preleva solo il primo dei contratti rinnovati ovvero a parità di
        // offerta e validità spaziale, relazione OD quelli con data fine contratto più alta
        var prec = "";

        var newCnt = contracts.filter(function (item) {
            var ideoff = ("00000" + item.ideoff).slice(-5);
            var codvalspa =("00000" + item.codvalspa).slice(-5)
            var codrelod= ("00000" + item.codrelod).slice(-5)


            var succ = ideoff + "_" + codvalspa + "_" + codrelod + item.datatvcnt;

            if (prec != succ) {
                prec = succ;
                return item;
            } else {
                return false;
            }
        });

        this.contractsOnCard = newCnt;

        // popola la tebella dei contratti su carta
        this.createTableContracts(this.contractsOnCard);
        this.$('#divSectionContracts').show();
    },


    /** implements table, salable offers **/
    salableOffersManagement: function (data) {

        this.createOfferSelector(data);

        this.$('#divSectionFares').show();
    },

    /**** Calls Api Rest Services ****/
    createOfferSelector: function (data) {

        var that = this;


       // $("<div id='divOffers' class='row'></div>").insertBefore("#divFareBuyTable")
        var conta = 0;
        var i = 0;

        // Sorta i contratti per offerta, validita spaziale, relazione OD, data fine contratto (discendente)
        //var coll = data.collection.models[0].attributes.listaPacchettiVendibili;
        var coll = data.listaPacchettiVendibili;

        //coll.sort(this.pacchettiVendibiliSort);

        $.each(coll, function(index, row) {

            // legge il template HTML per la scheda con l'offerta
            var myHtml = that.$("#divBlockTemplate")[0].outerHTML;
            // sostituisce i valori
            myHtml = myHtml.replace(new RegExp(/divBlockTemplate/g), "divBlock" + row.ideoff);
            myHtml = myHtml.replace(new RegExp(/\[ideoff\]/g), row.ideoff);
            myHtml = myHtml.replace(new RegExp(/\[codvalspa\]/g), row.codvalspa);
            myHtml = myHtml.replace(new RegExp(/\[desoff\]/g), row.desoff);
            myHtml = myHtml.replace(new RegExp(/\[qtavaltep\]/g), row.qtavaltep);
            myHtml = myHtml.replace(new RegExp(/\[maxOffVendibiliUtente\]/g), row.maxOffVendibiliUtente);
            myHtml = myHtml.replace(new RegExp(/\[pzz\]/g), app.class.utils.number.formatMoney(row.pzz, 2, " € ", "-", ","));
            myHtml = myHtml.replace(new RegExp(/\[pzzridotto\]/g), app.class.utils.number.formatMoney(row.pzz - 5, 2, " € ", "-", ","));
            myHtml = myHtml.replace(new RegExp(/\[pzzgratuito\]/g), app.class.utils.number.formatMoney(0, 2, " € ", "-", ","));
            myHtml = myHtml.replace(new RegExp(/\[finalpzz_intero\]/g), row.pzz);
            myHtml = myHtml.replace(new RegExp(/\[finalpzz_ridotto\]/g), row.pzz - 5);
            myHtml = myHtml.replace(new RegExp(/\[finalpzz_gratuito\]/g), 0);
            myHtml = myHtml.replace(new RegExp(/\[idetipcnt\]/g), (row.idetipcnt == 2 ? that.language.transportation : that.language.nottransportation));
            myHtml = myHtml.replace(new RegExp(/\[ideclaute\]/g), (row.ideclaute == 39 ? that.language.young : that.language.ordinary));

            // appende il div
            that.$("#divOffers").append(myHtml);

            // se il prezzo è 0 scrive Biglietto Gratuito
            if (row.pzz == 0) {
                that.$("#price" + row.ideoff).html(that.language.freeTicket);
            }

            // se è un offerta evento campo quantotà validita temporale = 999 mette il Per Saperne di più...
            if (row.qtavaltep == 999) {
                that.$("#btnmoreinfo" + row.ideoff).html(that.language.moreInfo);
            }

            // se è impostato il valore per il massimo delle offerte vendibili per utente lo mostra
            if (that.$("#maxOffVendibiliUtente" + row.ideoff).attr("data-value") != "null") {
                that.$("#maxOffVendibiliUtente" + row.ideoff).show();
            }


            that.$("#divBlock" + row.ideoff).show();

            // imposta l'evento click sul bottone Aggiungi al carrello
            var types = ["intero","ridotto","gratuito"];
            $.each(types, function(index, i) {
                that.$("#btn" + i + row.ideoff).unbind("click");
                that.$("#btn" + i + row.ideoff).on("click", function() {
                    var sel = $(this).data("id");
                    var maxoffvendibiliutente = $(this).data("maxoffvendibiliutente");
                    var pzz = $(this).data("finalpzz");
                    var offertaSel = that.routes.filter(function(row, index) {
                       return row.ideoff == sel;
                    });
    
                    var cart = app.global.tokensCollection.models[0].attributes.cart;
    
                    var offertaCart = cart.filter(function(row, index) {
                        if (row.ideoff == sel) {
                            if (!(maxoffvendibiliutente != "null" && row.Counter >= parseInt(maxoffvendibiliutente))) {
                                row.Counter++;
                                row.pzzTot += pzz;
                            }
                        }
                        return row.ideoff == sel;
                    });
    
                    if (offertaCart.length == 0) {
                        cart.push(offertaSel[0]);
                        cart[cart.length - 1].Counter = 1;
                        cart[cart.length - 1].pzzTot = cart[cart.length - 1].pzz;
                        app.global.tokensCollection.models[0].save();
                    }
    
                    var qtaTot = 0;
                    var pzzTot = 0;
                    cart.filter(function(row, index) {
                        qtaTot += row.Counter;
                        pzzTot += row.pzzTot;
                        app.global.tokensCollection.models[0].save();
                    })
                    that.updateBadgeTickets();
                    app.global.views.headerMyProfile.updateCart();
                });
            })
            

            // imposta l'evento click sul bottone Aggiungi al carrello
            that.$("#btnmoreinfo" + row.ideoff).unbind("click");

            that.$("#btnmoreinfo" + row.ideoff).on("click", function() {
                var ideoff = $(this).data("id");
                var codvalspa = $(this).data("codvalspa");
                var offertaEvento = $(this).data("qtavaltep");

                if (offertaEvento == 999) {
                    that.openMoreInfo(ideoff, codvalspa);
                } else {
                    that.accessMuseum(1, ideoff, codvalspa, "notActive");
                }
            });

        });

    },

    updateBadgeTickets: function () {
        var totAcquisti = app.global.tokensCollection.models[0].attributes.cart;
        var nTickets = 0;
        $.each(totAcquisti, function(index, row) {nTickets += row.Counter});
        this.$("#nTickets").html(nTickets > 0 ? nTickets : null);
    },

    // sort delle offerte per codoff veo
    pacchettiVendibiliSort : function (a, b){
        var Acodoffveo = a.codoffveo.indexOf("_") > -1 ? a.codoffveo : a.codoffveo + "_000";
        var Bcodoffveo = b.codoffveo.indexOf("_") > -1 ? b.codoffveo : b.codoffveo + "_000";

        var prec = Acodoffveo;
        var succ = Bcodoffveo;

        // sort per offera, validità spaziale, relazione OD e data fine contratto (discendente)
        return prec < succ ? -1 : (prec > succ ? 1 : 0);
    },

    /**** Calls Api Rest Services ****/
    callApiRestSalableOffers: function () {
        var dfd = new $.Deferred();
        var that = this;
        var params = {};

        params.ideseespt = 36;

        ritorno = "";

        $.ajax({
            type: "GET",
            url: "offerteVendibili.json",
            dataType: "json",
            success: function (xml) {

                that.salableOffersManagement(xml);
                that.faresToBuy = xml.listaPacchettiVendibili;
                return dfd.resolve();
            },
            error: function (statusCode) {
                return null;
            }
        });

        /*
        app.class.apiRest.pacchettivendibili.getPacchettiVendibiliList(params).done(function (data) {

            // -- Verifica se ci sono ERRORI APPLICATIVI [ data.attributes.result.success === false ]
            if (!data.attributes.result.success) {
                // -- Operation KO
            } else {
                // -- Operation OK
               // memorizza le offerte in memoria
                that.salableOffersManagement(data);
                that.faresToBuy = data.collection.models[0].attributes.listaPacchettiVendibili;
            }

            return dfd.resolve();

        }).fail(function (statusCode) {
            that.failCallApi(statusCode, 'buyOnCard.callApiRestSalableOffers')
        });

         */
        return dfd.promise();
    },



    /**** Calls Api Rest Services ****/
    callApiRestSpatialValidityZone: function (params) {
        var dfd = new $.Deferred();
        var that = this;

        return dfd.resolve();

        app.class.apiRest.spatialValidity.getZoneList(params).done(function (data) {

            // -- Verifica se ci sono ERRORI APPLICATIVI [ data.attributes.result.success === false ]
            if (!data.attributes.result.success) {
                // -- Operation KO
                that.failCallApi(0, 'buyOnCard.callApiRestSpatialValidityZone.getZoneListInd');

            } else {
                // -- Operation OK
                $(data.collection.models[0].attributes.spatialvalidityZoneList).map(function () {
                    that.$("#codvalspaForm").append($('<option>').val(this.codvalspa).text(this.desvalspa));
                });

                return dfd.resolve();
            }

        }).fail(function (statusCode) {
            that.failCallApi(statusCode, 'buyOnCard.callApiRestSpatialValidityZone.getZoneListInd')
        });
        return dfd.promise();
    },

    callApiRestGruppiMusei: function (infoCard) {
        var dfd = new $.Deferred();
        var that = this;

        return dfd.resolve();

        app.class.apiRest.zona.getGruppiMusei().done(function (data) {

            // -- Verifica se ci sono ERRORI APPLICATIVI [ data.attributes.result.success === false ]
            if (data.attributes.result.success) {
                that.gruppiMusei = data;
            }

            return dfd.resolve();

        }).fail(function (statusCode) {
            that.failCallApi(statusCode, 'buyOnCard.callApiRestActiveSmartCard');
            return dfd.resolve();
        });
        return dfd.promise();
    },

    btnCart : function() {
        Backbone.history.navigate("#" + this.language.lang + "/cart", {trigger: true});
    },

    /**** Calls Api Rest Services ****/
    callApiRestSpatialValidityZone: function () {
        var dfd = new $.Deferred();
        var that = this;

        var params = {};
        params.ideoff = 849;

        return dfd.resolve();

        app.class.apiRest.spatialValidity.getZoneList(params).done(function (data) {

            // -- Verifica se ci sono ERRORI APPLICATIVI [ data.attributes.result.success === false ]
            if (!data.attributes.result.success) {
                // -- Operation KO
                that.failCallApi(0, 'buyOnCard.callApiRestSpatialValidityZone.getZoneListInd');

            } else {
                // -- Operation OK
                $(data.collection.models[0].attributes.spatialvalidityZoneList).map(function () {
                    that.$("#codvalspaForm").append($('<option>').val(this.codvalspa).text(this.desvalspa));
                });

                return dfd.resolve();
            }

        }).fail(function (statusCode) {
            that.failCallApi(statusCode, 'buyOnCard.callApiRestSpatialValidityZone.getZoneListInd')
        });
        return dfd.promise();
    },


    openMoreInfo : function(ideoff, codvalspa) {
        var that = this;

        that.$("#myModalMoreInfo").modal("show");

        var museiRidotti = this.faresToBuy.filter(function(row, index) {
            if (row.codvalspa == codvalspa && row.ideoff == ideoff) {
                that.$("#guideMoreInfo div").html(row.desdetoff);
            }
        });

    },




    accessMuseum : function(numtan, ideoff, codvalspa, how) {
        var that = this;

        if (that.gruppiMusei == null) {
            return true;
        }

        // filtra dalle offerte l'elenco dei musei visitabili in modalità ridotta
        var codvalspaRidotti = -1;
        var paramControl = null;

        var museiRidotti = this.faresToBuy.filter(function(row, index) {
            if (row.codvalspa == codvalspa && row.ideoff == ideoff) {
                codvalspaRidotti =  row.parametriControlloAccessi.codvalspa;
                paramControl = row.parametriControlloAccessi;
                if (codvalspaRidotti == codvalspa) {
                    codvalspaRidotti = -1;
                }
            }
        });

        // seleziona i musei visitabili e quelli eventualmente visitabili in modalità ridotta
        var musei = this.gruppiMusei.attributes.listaGruppiMusei.filter(function(row, index) {
            return row.codvalspa == codvalspa;
        });

        var museiRidotti = this.gruppiMusei.attributes.listaGruppiMusei.filter(function(row, index) {
            return row.codvalspa == codvalspaRidotti;
        });

        if (museiRidotti.length > 0) {
            musei.push(museiRidotti[0]);
        }

        if (musei.length > 0) {
           that.accessMuseumShow(numtan, musei, paramControl, how);
        }

    },

    accessMuseumShow : function(numtan, data, paramControl, how) {
        var that = this;


        // nasconde la legnda
        that.$("#guide").show();
        if (how == "notActive") {
            that.$("#guide").hide();
        }
        // gestisce la guida agli accessi
        that.$("#guideAccess").show();
        that.$("#guideAccess li").hide();

        if (paramControl.numaccmax != null) {
            var testo = that.language.guideNumAccess.replace("[numaccess]", paramControl.numaccmax);
            that.$("#guideNumAccess h6").text(testo);
            that.$("#guideNumAccess").show();
            that.$("#guideMinicircuit").show();
        }

        if (paramControl.indaccmlt != null) {
            if (paramControl.indaccmlt === "1") {
                that.$("#guideAccessForOneSite").show();
            }
            if (parseFloat(paramControl.indaccmlt) > 1) {
                var testo = that.language.guideAccessForMoreSite.replace("[numaccess]", paramControl.indaccmlt);
                that.$("#guideAccessForMoreSite h6").text(testo);
                that.$("#guideAccessForMoreSite").show();
            }
        }
        // chiude l'elenco dei musei
        that.$("#museum ul").removeClass("show");
        that.$("#museumList span").html(that.language.showFreeAccess)
        that.$("#museumList svg").removeClass("fa-eye-slash");
        that.$("#museumList svg").addClass("fa-eye");

        // chiude l'elenco dei musei con accesso ridotto
        that.$("#discountMuseum ul").removeClass("show");
        that.$("#museumListDiscount span").html(that.language.showDiscountAccess)
        that.$("#museumListDiscount svg").removeClass("fa-eye-slash");
        that.$("#museumListDiscount svg").addClass("fa-eye");
        that.$("#myModalAccessMuseum").modal("show");

        //elimina l'elenco dei musei serve per pulire gli elenchi
        that.$(".elementMuseum").remove();
        that.$("#discountMuseum").hide();
        that.$(".elementMuseumDiscount").remove();


        $.each(data[0].listaMusei, function(index, row) {
            // legge il template HTML per la scheda con l'offerta
            var myHtml = that.$("#cdMuseoTemplate")[0].outerHTML;
            // sostituisce i valori
            myHtml = myHtml.replace(new RegExp(/cdMuseoTemplate/g), "cdMuseo" + row.idemuseo);
            myHtml = myHtml.replace(new RegExp(/\[idemuseo\]/g), row.idemuseo);
            myHtml = myHtml.replace(new RegExp(/\[museo\]/g), row.museo);

            // appende il div
            that.$("#museum ul").append(myHtml);

            that.$("#cdMuseo" + row.idemuseo).addClass("elementMuseum");

            that.$("#cdMuseo" + row.idemuseo + " .minicircuito").hide();
            if (row.minicircuitoList.length > 0) {
                that.$("#cdMuseo" + row.idemuseo + " .minicircuito").html("");

                $.each(row.minicircuitoList, function(index, minData) {
                    that.$("#cdMuseo" + row.idemuseo + " .minicircuito").append(minData.des + "<br />");
                });
                that.$("#cdMuseo" + row.idemuseo + " .minicircuito").show();
            }

            that.$("#cdMuseo" + row.idemuseo).show();
        });

        // vede se ci sono anche musei con ridotto
        if (data.length > 1) {
            that.accessMuseumDiscountShow(numtan, data[1]);
        }

    },

    accessMuseumDiscountShow : function(numtan, data) {
        var that = this;

        that.$("#discountMuseum").show();
        that.$(".elementMuseumDiscount").remove();

        $.each(data.listaMusei, function(index, row) {
            // legge il template HTML per la scheda con l'offerta
            var myHtml = that.$("#cdMuseoDiscountTemplate")[0].outerHTML;
            // sostituisce i valori
            myHtml = myHtml.replace(new RegExp(/cdMuseoDiscountTemplate/g), "cdMuseoDiscount" + row.idemuseo);
            myHtml = myHtml.replace(new RegExp(/\[idemuseo\]/g), row.idemuseo);
            myHtml = myHtml.replace(new RegExp(/\[museo\]/g), row.museo);

            // appende il div
            that.$("#discountMuseum ul").append(myHtml);

            that.$("#cdMuseoDiscount" + row.idemuseo).addClass("elementMuseumDiscount");
            that.$("#cdMuseoDiscount" + row.idemuseo).show();
        });
    },

    museumListToggler : function() {
        var that = this;

        that.$("#museumList span").text(function(i,old){
            if (that.$("#museumList svg").hasClass("fa-eye")) {
                that.$("#museumList span").html(that.language.hideFreeAccess)
                that.$("#museumList svg").removeClass("fa-eye");
                that.$("#museumList svg").addClass("fa-eye-slash");
            } else {
                that.$("#museumList span").html(that.language.showFreeAccess)
                that.$("#museumList svg").removeClass("fa-eye-slash");
                that.$("#museumList svg").addClass("fa-eye");
            }

            return old.text;
        });

    },

    museumListDiscountToggler : function() {
        var that = this;

        that.$("#museumListDiscount span").text(function(i,old){
            if (that.$("#museumListDiscount svg").hasClass("fa-eye")) {
                that.$("#museumListDiscount span").html(that.language.hideDiscountAccess)
                that.$("#museumListDiscount svg").removeClass("fa-eye");
                that.$("#museumListDiscount svg").addClass("fa-eye-slash");
            } else {
                that.$("#museumListDiscount span").html(that.language.showDiscountAccess)
                that.$("#museumListDiscount svg").removeClass("fa-eye-slash");
                that.$("#museumListDiscount svg").addClass("fa-eye");
            }

            return old.text;
        });
    },

});
