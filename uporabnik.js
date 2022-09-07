let ehrID;

function prikazMeritev(type) {
    $.ajax({
        url: baseUrl + "vrni/" + ehrID + "|" + "meritve",
        type: "GET",
        contentType: "application-json",
        success: function(data) {
            let tabela = " ";
            if(type === 1 || type === 2 || type === 3)
                tabela += "<button type='button' class='btn btn-primary btn-xs'" +
                    " onClick='prikazMeritev(0)'>Prikaz meritev temperature</button>";
            if(type === 0 || type === 2 || type === 3)
                tabela += "<button type='button' class='btn btn-primary btn-xs'" +
                    " onClick='prikazMeritev(1)'>Prikaz meritev nasičenosti kisika v krvi</button>";
            if(type === 0 || type === 1 || type === 3)
                tabela += "<button type='button' class='btn btn-primary btn-xs'" +
                    " onClick='prikazMeritev(2)'>Prikaz vseh meritev</button>";
            if(type === 0 || type === 1 || type === 2)
                tabela += "<button type='button' class='btn btn-primary btn-xs'" +
                    " onClick='prikazMeritev(3)'>Skrij podatke</button>";

            if(type === 3) $("#meritvePrikaz").html(tabela);
            else {
                tabela += "<table class='table table-striped'>" + "<tr><th>Datum meritve</th>";
                if (type === 0 || type === 2) tabela += "<th>Temperatura</th>";
                if (type === 1 || type === 2) tabela += "<th>Nasičenost krvi s kisikom</th>";
                tabela += "</tr>";
                for (let i = 0; i < data.length; i++) {
                    console.log(data[i].datum);
                    let datum = data[i].datum[0] + "." +
                        data[i].datum[1] + "." +
                        data[i].datum[2];
                    tabela += "<tr><td>" + datum + "</td>";
                    if (type == 0 || type == 2) tabela += "<td>" + data[i].temperatura + "</td>";
                    if (type == 1 || type == 2) tabela += "<td>" + data[i].nasicenostKisik + "</td>";
                    tabela += "</tr>";
                }
                tabela += "</table>";
                $("#meritvePrikaz").html(tabela);
            }
        },
        error: function(err) {
            console.log(err.responseText);
        }
    });
}

async function novaMeritev() {
    let datum = $("#novaMeritevDatum").val().split("-");
    let temperatura = parseFloat($("#novaMeritevTemperatura").val());
    let kisik = parseFloat($("#novaMeritevKisik").val());

    let currentDate = new Date();
    let veljavenDatum = false; let veljavnaTemperatura = false; let veljavenKisik = false;
    if(parseInt(datum[0]) === 2021 && parseInt(datum[1]) === currentDate.getMonth() ||
       parseInt(datum[1]) === currentDate.getMonth() + 1 && parseInt(datum[2]) < currentDate.getDate())
       veljavenDatum = true;
    else $("#meritevSporocilo").html("Dodajte veljaven datum!");
    if(temperatura > 30 && temperatura < 43 ) veljavnaTemperatura = true;
    else $("#meritevSporocilo").html("Dodajte veljavno temperaturo!");
    if(kisik > 85 && kisik <= 100) veljavenKisik = true;
    else $("#meritevSporocilo").html("Dodajte veljavno vrendnost nasičenosti krvi s kisikom!");

    if(veljavnaTemperatura && veljavenKisik && veljavenDatum) {
        $("#meritevSporocilo").html("Dodajanje meritve uspešno!");
        let tmp = datum[0];
        datum[0] = datum[2];
        datum[2] = tmp;
        for (let i = 0; i < 3; i++) datum[i].replace(/^0+/, '');
        console.log("datum " + datum);
        let podatki = {
            datum: datum,
            temperatura: temperatura,
            nasicenostKisik: kisik,
        };
        await ustvariMeritveBolnika(0, podatki, ehrID);
        await ustvariOceno();
    }
}

function ustvariOceno() {
    $.ajax({
        url: baseUrl + "vrni/" + ehrID,
        type: "GET",
        contentType: "application-json",
        success: function(data) {
            let currentDate = new Date();
            let zdravstvenoStanje = 0;
            let dniOdZacKarantene = 0;
            console.log(data);
            let starost = currentDate.getFullYear() - parseInt(data.datumRojstva[2]);
            let simptomi = $('input[type="checkbox"]:checked').length;

            if(parseInt(data.zacetekKarantene[1]) === currentDate.getMonth() ||
               parseInt(data.zacetekKarantene[1]) === (currentDate.getMonth() + 1) &&
               parseInt(data.zacetekKarantene[0]) <= currentDate.getDate()) {
                if(parseInt(data.zacetekKarantene[1]) === (currentDate.getMonth() + 1))
                    dniOdZacKarantene = currentDate.getDate() - parseInt(data.zacetekKarantene[0]);
                else if(parseInt(data.zacetekKarantene[1]) === currentDate.getMonth())
                    dniOdZacKarantene = currentDate.getDate() + (31 - parseInt(data.zacetekKarantene[0]));

                let dniNajnovejseMeritve = 100000;
                let index = 0;
                console.log(data.meritve[0]);
                for (let i = 0; i < data.meritve.length; i++) {
                    let dniOdZadMeritve = 0;
                    if (parseInt(data.meritve[i].datum[1]) === (currentDate.getMonth() + 1)) {
                        dniOdZadMeritve = currentDate.getDate() - parseInt(data.meritve[i].datum[1]);
                    } else if (parseInt(data.meritve[i].datum[1]) === (currentDate.getMonth() + 1) &&
                        parseInt(data.meritve[i].datum[1]) <= currentDate.getDate()) {
                        dniOdZadMeritve = currentDate.getDate() + (31 - parseInt(data.meritve[i].datum[1]));
                    }
                    if(dniNajnovejseMeritve > dniOdZadMeritve) {
                        dniNajnovejseMeritve = dniOdZadMeritve;
                        index = i;
                    }
                }
                let najnovejsaMeritev = data.meritve[index];

                if(dniOdZacKarantene >= 10 && dniOdZacKarantene <= 20) zdravstvenoStanje++;
                if(dniOdZacKarantene > 20) zdravstvenoStanje++;
                if(starost > 70) zdravstvenoStanje++;
                if(starost > 80) zdravstvenoStanje++;
                if(simptomi > 2) zdravstvenoStanje++;
                if(simptomi > 3) zdravstvenoStanje++;
                if(simptomi > 4) zdravstvenoStanje++;
                if(najnovejsaMeritev.temperatura > 39) zdravstvenoStanje++;
                if(najnovejsaMeritev.temperatura > 40) zdravstvenoStanje++;
                if(najnovejsaMeritev.nasicenostKisik < 95) zdravstvenoStanje++;
                if(najnovejsaMeritev.nasicenostKisik < 92) zdravstvenoStanje++;
                console.log("zdravstveno stanje: " + zdravstvenoStanje);
                if(zdravstvenoStanje >= 9) {
                    $("#nasvetiID").html("Vaše zdravstveno stanje je resno. Priporočamo vam, da pokličete vašega " +
                                         "zdravnika za podrobnejše napotke.");
                }
                else if (zdravstvenoStanje >= 6 && zdravstvenoStanje < 9) {
                    $("#nasvetiID").html("Vaše zdravstveno stanje je stabilno. Kljub temu vam v naslednjih dneh " +
                                         "priporočamo počitek. ");
                }
                else {
                    let kar = 10 - dniOdZacKarantene;
                    if(kar < 0) kar = 0;
                    $("#nasvetiID").html("Vaše zdravstveno stanje je stabilno. Karanteno lahko zapustite čez " + kar + " dni.");
                }
            }
            else $("#nasvetiID").html("Vaša karantena se je začela pred več kot mesecem dni. " +
                                       "V kolikor se vaše zdravstveno stanje še ni poboljšalo vam priporočamo da " +
                                       "pokličete vašega osebnega zdravnika.");
        },
        error: function(err) {
            console.log(err.responseText);
            $("#nasvetiID").html("Neuspešno!");
        }
    });
}

$(document).ready(function() {
    ehrID = document.cookie.split("=");
    ehrID = ehrID[1];
    $.ajax({
        url: baseUrl + "vrni/" + ehrID,
        type: "GET",
        contentType: "application-json",
        success: function (data) {
            let naslov = "<h4>Vaš EHR: " + ehrID + "</h4>";
            $("#meritveEHRPrikaz").html(naslov);
        },
        error: function (err) {
            console.log(err.responseText);
        }
    });
});
