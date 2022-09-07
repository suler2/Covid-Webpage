var baza = 'suler2';
var baseUrl = 'https://teaching.lavbic.net/api/OIS/baza/' + baza + '/podatki/';

let bolniki = [
  {
    ehrID: "7c0bee12-70c3-45a3-a6fc-3a649a33b71b",
    ime: "Janez",
    priimek: "Novak",
    datumRojstva: ["4", "4", "1973"],
    zacetekKarantene: ["13", "5", "2021"],
    danMeritve: [
      {
        datum: ["13", "5", "2021"],
        temperatura: 39.4,
        nasicenostKisik: 96.3,
      },
      {
        datum: ["14", "5", "2021"],
        temperatura: 38.2,
        nasicenostKisik: 97.6,
      },
      {
        datum: ["15", "5", "2021"],
        temperatura: 37.2,
        nasicenostKisik: 99.0,
      },
      {
        datum: ["16", "5", "2021"],
        temperatura: 36.3,
        nasicenostKisik: 99.6,
      },{
        datum: ["17", "5", "2021"],
        temperatura: 36.5,
        nasicenostKisik: 100.0,
      },
    ]
  },
  {
    ehrID: "3b71b27a-3b7d-474a-93e1-3cf1880a401d",
    ime: "Krištof",
    priimek: "Kolumb",
    datumRojstva: ["14", "9", "2000"],
    zacetekKarantene: ["15", "5", "2021"],
    danMeritve: [
      {
        datum: ["15", "5", "2021"],
        temperatura: 38.3,
        nasicenostKisik: 98.6,
      },
      {
        datum: ["16", "5", "2021"],
        temperatura: 37.4,
        nasicenostKisik: 99.3,
      },
      {
        datum: ["17", "5", "2021"],
        temperatura: 36.8,
        nasicenostKisik: 99.8
      }
    ],
  },
  {
    ehrID: "9ff2e339-653d-473d-bd79-afaafe13679c",
    ime: "Jonas",
    priimek: "Žnidaršič",
    datumRojstva: "30-1-1962",
    zacetekKarantene: ["13", "5", "2021"],
    danMeritve: [
      {
        datum: ["13", "5", "2021"],
        temperatura: 37.5,
        nasicenostKisik: 99,
      },
      {
        datum: ["14", "5", "2021"],
        temperatura: 38.6,
        nasicenostKisik: 97.4,
      },
      {
        datum: ["15", "5", "2021"],
        temperatura: 39.4,
        nasicenostKisik: 95.4,
      },
      {
        datum: ["16", "5", "2021"],
        temperatura: 39.0,
        nasicenostKisik: 95.0,
      },
      {
        datum: ["17", "5", "2021"],
        temperatura: 38.4,
        nasicenostKisik: 93.0,
      },
    ]
  }
];

/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */

async function izbrisiBazo() {
  await $.ajax({
    url: baseUrl + "brisi",
    type: "DELETE",

    success: function(data) {
      console.log("Uspesno izbrisano!");
    },
    error: function(err) {
      console.log(err);
      alert("Napaka '" + JSON.parse(err.responseText) + "'!");
    }
  });
}

async function ustvariBolnika(stPacienta, data, ehr) {
  let podatki;
  let ehrID;
  if(stPacienta == 0) {
    ehrID = ehr;
    podatki = data;
  }
  else {
    ehrID = bolniki[stPacienta - 1].ehrID;
    podatki = {
      ime: bolniki[stPacienta - 1].ime,
      priimek: bolniki[stPacienta - 1].priimek,
      datumRojstva: bolniki[stPacienta - 1].datumRojstva,
      zacetekKarantene: bolniki[stPacienta - 1].zacetekKarantene,
    };
  }
  await $.ajax({
    url: baseUrl + "azuriraj?kljuc=" + ehrID,
    type: "PUT",
    contentType: "application/json",
    data: JSON.stringify(podatki),
    success: function(data){
      console.log("Uspesno vnesen bolnik");
    },
    error: function(err) {
      console.log(JSON.parse(err.responseText));
    }
  });
}

async function ustvariMeritveBolnika(stPacienta, data, ehr) {
  if(stPacienta == 0){
    stPacienta = -1;
    let ehrID = ehr;
    let podatki = data;
    await $.ajax({
      url: baseUrl + "azuriraj?kljuc=" + ehrID + "|meritve" + "&elementTabele=true",
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(podatki),
      success: function (data) {
        console.log("Uspesno vnesene podrobnosti bolnika!");
      },
      error: function (err) {
        console.log(JSON.parse(err.responseText));
      }
    });
  }
  else {
    for(let i = 0; i < bolniki[stPacienta - 1].danMeritve.length; i++) {
      podatki = {
        datum: bolniki[stPacienta - 1].danMeritve[i].datum,
        temperatura: bolniki[stPacienta - 1].danMeritve[i].temperatura,
        nasicenostKisik: bolniki[stPacienta - 1].danMeritve[i].nasicenostKisik
      };
      await $.ajax({
        url: baseUrl + "azuriraj?kljuc=" + bolniki[stPacienta - 1].ehrID + "|meritve" + "&elementTabele=true",
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(podatki),
        success: function (data) {
          console.log("Uspesno vnesene podrobnosti bolnika!");
        },
        error: function (err) {
          console.log(JSON.parse(err.responseText));
        }
      });
    }
  }
}

function vrniVseUporabnike(show) {
  $.ajax({
    url: baseUrl + "vrni/"  + "vsi",
    type: "GET",
    contentType: "application-json",
    success: function(uporabniki) {
      let keys = Object.keys(uporabniki);
      if(show) {
        let sporocilo = "Uspešno zgenerirani " + keys.length + " uporabniki: \n";
        for(let i = 0; i < keys.length; i++) {
          sporocilo += "EHR: {" + keys[i] + "}\n";
          sporocilo += "Ime in Priimek: [" + uporabniki[keys[i]].ime + " " + uporabniki[keys[i]].priimek + "]\n";
        }
        alert(sporocilo);
      }
      let content = "<option value=''></option>";
      for(let i = 0; i < keys.length; i++) {
        content += "<option value='" + keys[i]  + "'>" + keys[i] + "</option>";
      }
      $("#prijavaIzbraniEHR").html(content);
    },
    error: function(err) {
      console.log("funkcija vrniVseUporabnike() je bila neuspešna");
      console.log(JSON.parse(err.responseText));
    }
  });
}

async function generirajPodatke(stPacienta) {
  if(stPacienta == 1) await izbrisiBazo();
  await ustvariBolnika(stPacienta);
  await ustvariMeritveBolnika(stPacienta);
  if(stPacienta < 3) {
    await generirajPodatke(stPacienta + 1);
  }
  else {
    await vrniVseUporabnike(true);
  }
}

// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija



function pridobiZeton() {
  $.ajax({
    url: "https://teaching.lavbic.net/api/OIS/ERC20/suler2/0x7AB367F29C27ed01C2d8D7ED0844625196d9CAda",
    type: "GET",
    contentType: "application-json",
    success: function(response){
      console.log("uspesno");
      console.log(response);
    },
    error: function(response){
      console.log("neuspesno");
      console.log(response);
    }
  });
}

function novEhrID() {
   return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function novBolnik() {
  let ime = $("#novBolnikIme").val();
  let priimek = $("#novBolnikPriimek").val();
  let datumRojstva = $("#novBolnikDatumRojstva").val().split("-");
  let zacetekKarantene = $("#novBolnikZacetekKarantene").val().split("-");
  let reg = /^[a-zčćžđš\-]+$/;
  let validIme = false; let validPriimek = false; let validDatumRojstva = false; let validZacetekKarantene = false;
  let currentDate = new Date();
  if(ime.length < 3 && ime.length > 12)
    $("#registracijaSporocilo").html("Polje Ime mora vsebovati med 3 in 12 znakov!");
  else if (!reg.test(ime.toLowerCase()))
    $("#registracijaSporocilo").html("Polje Ime vsebuje neveljavne znake!");
  else validIme = true;
  if(priimek.length > 3 && priimek.length > 12)
    $("#registracijaSporocilo").html("Polje Priimek mora vsebovati med 3 in 12 znakov!");
  else if (!reg.test(priimek.toLowerCase()))
    $("#registracijaSporocilo").html("Polje Priimek vsebuje neveljavne znake!");
  else validPriimek = true;
  if(parseInt(datumRojstva[0]) > 1920 && parseInt(datumRojstva[0]) < 2022) validDatumRojstva = true;
  else $("#registracijaSporocilo").html("Polje Datum Rojstva je neveljavno!");
  if(parseInt(zacetekKarantene[0]) == 2021 && parseInt(zacetekKarantene[1]) === currentDate.getMonth() ||
      parseInt(zacetekKarantene[1]) === currentDate.getMonth() + 1 &&
      parseInt(zacetekKarantene[2]) < currentDate.getDate()) validZacetekKarantene = true;
  else $("#registracijaSporocilo").html("Polje Začetek karantene je neveljavno! Začetek karantene ne sme biti" +
                                        " starejše od enega meseca!");
  if(validIme && validDatumRojstva && validPriimek && validZacetekKarantene) {
    let tmp = datumRojstva[0];
    datumRojstva[0] = datumRojstva[2];
    datumRojstva[2] = tmp;
    tmp = zacetekKarantene[0];
    zacetekKarantene[0] = zacetekKarantene[2];
    zacetekKarantene[2] = tmp;
    for (let i = 0; i < 3; i++){
      datumRojstva[i].replace(/^0+/, '');
      zacetekKarantene[i].replace(/^0+/, '');
    }
    let podatki = {
      ime: ime,
      priimek: priimek,
      datumRojstva: datumRojstva,
      zacetekKarantene: zacetekKarantene,
      meritve: []
    };
    let ehrID = novEhrID();
    await ustvariBolnika(0, podatki, ehrID);
    await vrniVseUporabnike(false);
    alert("Registracija uspešna!");
    await prijavaEHR(0, ehrID);
  }
}


async function prijavaEHR(type, data) {
  let ehrID = "";
  if(type == 1) ehrID = $("#prijavaVnosnoPolje").val();
  else if(type == 2) ehrID = $("#prijavaIzbraniEHR").find(":selected").text();
  else ehrID = data;

  if (ehrID != "") {
    document.cookie = "ehrID=" + ehrID;

    await $.ajax({
      url: baseUrl + "vrni/" + ehrID,
      type: "GET",
      contentType: "application-json",
      success: function (data) {
        window.location.href = "uporabnik.html";
      },
      error: function (err) {
        alert("Napačen vnos EHR!");
        console.log(JSON.parse(err.responseText));
      }
    });

  }
}

$(document).ready(function() {

  vrniVseUporabnike(false);
});
