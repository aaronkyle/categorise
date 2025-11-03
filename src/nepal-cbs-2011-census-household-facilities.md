# Facilities in Households, Nepal, 2011

Data Source: [Census Nepal, 2011](https://censusnepal.cbs.gov.np/Home/Details?tpid=5&dcid=44c9ea09-db76-4b98-a63a-28bb2f73eabe&tfsid=1)

## Province Wise

```js echo
const byProvince = data.byProvince
```

```js echo
Inputs.table(byProvince)
```

## District Wise

```js echo
const byDistrict = data.byDistrict
```

```js echo
Inputs.table(byDistrict)
```

## Municipality Wise

```js echo
const byMuncipality = data.byLocalLevel
```

```js echo
Inputs.table(byMuncipality)
```

## Municipality Alternate Names

This is a dictionary of names to match names in the
[`admin_municipalities` GeoJSON](https://observablehq.com/@adb/nepal-official-spatial-data-on-administrative-divisions#admin_municipalities).


```js echo
Inputs.table(alternateMunicipalityNames)
```

```js echo
const alternateMunicipalityNames = new Map(
  d3.csvParseRows(`Aadarsha Gaunpalika,Adharsha Gaunpalika
Aadarsha Kotwal Gaunpalika,Adarshkotwal Gaunpalika
Aairawati Gaunpalika,Ayirabati Gaunpalika
Aalital Gaunpalika,Alital Gaunpalika
Aanbu Khaireni Gaunpalika,Anbukhaireni Gaunpalika
Aathabisakot Municipality,Aathbiskot Municipality
Aatharai Gaunpalika,Aathrai Gaunpalika
Aatharai Tribeni Gaunpalika,Aathrai Tribeni Gaunpalika
Aathbis Municipality,Aathbis Nagarpalika
Agmisair Krishna Sabaran Gaunpalika,Agnisair Krishna Savaran Gaunpalika
Aiselukharka Gaunpalika,Ainselukharka Gaunpalika
Ajayameru Gaunpalika,Ajaymeru Gaunpalika
Arjun Choupari Gaunpalika,Arjunchaupari Gaunpalika
Aurahi Gaunpalika,Aaurahi Gaunpalika
Badi Kedar Gaunpalika,Badikedar Gaunpalika
Bagachour Municipality,Bagchaur Municipality
Baganaskali Gaunpalika,Bagnaskali Gaunpalika
Bahrabise Municipality,Barhabise Municipality
Bahragaun Muktikshetra Gaunpalika,Barhagaun Muktikhsetra Gaunpalika
Bahudarmai Municipality,Bahudaramai Municipality
Baitedhar Gaunpalika,Baiteshwor Gaunpalika
Balawa Municipality,Balwa Municipality
Balephi Gaunpalika,Balefi Gaunpalika
Banagad Kupinde Municipality,Bangad Kupinde Municipality
Bangalachuli Gaunpalika,Banglachuli Gaunpalika
Bannigadhi Jayagadh Gaunpalika,Bannigadi Jayagadh Gaunpalika
Banphikot Gaunpalika,Banfikot Gaunpalika
Bansgadhi Municipality,Bansagadhi Municipality
Baraha Pokhari Gaunpalika,Barahapokhari Gaunpalika
Barahatal Gaunpalika,Barahtal Gaunpalika
Bardagoriya Gaunpalika,Bardagariya Gaunpalika
Bareng Gaunpalika,Woreng Gaunpalika
Barhadashi Gaunpalika,Garhadashi Gaunpalika
Belouri Municipality,Belauri Municipality
Bensi Shahar Municipality,Besishahar Municipality
Bhageshwor Gaunpalika,Bhageshwar Gaunpalika
Bhoome Gaunpalika,Bhume Gaunpalika
Binayi Tribeni Gaunpalika,Binayee Tribeni Gaunpalika
Birgunj Metropolitian City,Belwa Gaunpalika
Bitthadchir Gaunpalika,Bithadchir Gaunpalika
Bogatan Gaunpalika,Bogtan Gaunpalika
Boudhimai Municipality,Baudhimai Municipality
Brahmapuri Gaunpalika,Bramhapuri Gaunpalika
Brindaban Municipality,Birndaban Municipality
Budhanilkhantha Municipality,Budhanilakantha Municipality
Chainapur Municipality,Chainpur Municipality
Chaudandigadhi Municipality,Chaudandigadi Municipality
Chauri Deurali Gaunpalika,Chaurideurali Gaunpalika
Chhabis Pathibhara Gaunpalika,Chabispathivera Gaunpalika
Chhatradev Gaunpalika,Chattradev Gaunpalika
Chhatrakot Gaunpalika,Chatrakot Gaunpalika
Chhatreshwori Gaunpalika,Chhatreswari Gaunpalika
Chishankhu Gadhi Gaunpalika,Chisankhugadhi Gaunpalika
Choutara Sangachowkgadhi Municipality,Chautara SangachokGadhi Municipality
Chumanubri Gaunpalika,Chum Nubri Gaunpalika
Dakneshwori Municipality,Dakneshwari Municipality
Dasharathchand Municipality,Dasharathchanda Municipality
Dewahi Gonahi Municipality,Dewahhi Gonahi Municipality
Dewangunj Gaunpalika,Dewanganj Gaunpalika
Dhanakaul Gaunpalika,Dhankaul Gaunpalika
Dhanapalthan Gaunpalika,Dhanpalthan Gaunpalika
Dhanushadham Municipality,Dhanusadham Municipality
Dhudha Koushika Gaunpalika,Thulung Dudhkoshi Gaunpalika
Dhudhakoshi Gaunpalika,Dudhkoshi Gaunpalika
Dhunibenshi Municipality,Dhunibesi Municipality
Dipayal Silgadhi Municipality,Dipayal Silgadi Municipality
Dogada Kedar Gaunpalika,Dogadakedar Gaunpalika
Doramba Gaunpalika,Doraamba Gaunpalika
Dudhapokhari Gaunpalika,Dudhpokhari Gaunpalika
Duhun Gaunpalika,Dunhu Gaunpalika
Dupcheshwor Gaunpalika,Dupcheshwar Gaunpalika
Durga Bhagawati Gaunpalika,Durga Bhagwati Gaunpalika
Ekadara Gaunpalika,Ekdanra Gaunpalika
Fakfokathum Gaunpalika,Fakphokthum Gaunpalika
Falgunanda Gaunpalika,Galgunanda Gaunpalika
Gadhawa Gaunpalika,Gadwa Gaunpalika
Galchhi Gaunpalika,Galchi Gaunpalika
Ganga Jamuna Gaunpalika,Gangajamuna Gaunpalika
Ganyapdhura Gaunpalika,Ganayapdhura Gaunpalika
Gauradaha Municipality,Gauradhaha Municipality
Gharpajhong Gaunpalika,Gharapjhong Gaunpalika
Godaita Municipality,Gaudeta Municipality
Godawari Municipality,Gadawari Municipality
Gulmi Durbar Gaunpaika,Gulmidarbar Gaunpaika
Hansapur Municipality,Hansapur Kathapulla Municipality
Hanumannagar Kankalini Municipality,Hanumannagar Kankalan Municipality
Hariharpurgaghi Gaunpalika,Hariharpurgadhi Gaunpalika
Hilihan Gaunpalika,Hilihang Gaunpalika
Ichchha Kamana Gaunpalika,Ichchhyakamana Gaunpalika
Illam Municipality,Ilam Municipality
Indrasarowar Gaunpalika,Indrasarawor Gaunpalika
Indrawoti Gaunpalika,Indrawati Gaunpalika
Jaleshwor Municipality,Jaleswor Municipality
Janak Nandini Gaunpalika,Janaknandani Gaunpalika
Jante Dhunga Gaunpalika,Jantedhunga Gaunpalika
Jayaprithbi Municipality,JayaPrithivi Municipality
Jhimaruk Gaunpalika,Jhimruk Gaunpalika
K.I. Singh Gaunpalika,K I Singh Gaunpalika
Kabilashi Municipality,Kabilasi Municipality
Kachanakawal Gaunpalika,Kachankawal Gaunpalika
Kageshwori Manahara Municipality,Kageshwori Manahora Municipality
Kalaiya Sub-Metropolitian City,Kaliya Sub-Metropolitian City
Kaligandaki Gaunpalika,Kaligandagi Gaunpalika
Kalinchowk Gaunpalika,Kalinchok Gaunpalika
Kamal bazar Municipality,Kamalbazar Municipality
Kamala Municipality,Kamala Siddhidatri Gaunpalika
Kanaka Sundari Gaun Palika,Kanakasundari Gaunpalika
Kapilbastu Municipality,Kapilvastu Municipality
Kedarsyun Gaunpalika,Kedarseu Gaunpalika
Khalsa Chhintang Sahidbhumi Gaunpalika,Shahidbhumi Gaunpalika
Khandabari Municipality,Khandbari Municipality
Khandadevi Gaunpalika,Khadadevi Gaunpalika
Khaptad Chhanna Gaunpalika,Khaptadchhanna Gaunpalika
Khiji Demba Gaunpalika,Khijidemba Gaunpalika
Khumbu Pasanglhamu Gaunpalika,Khumbupasanglahmu Gaunpalika
Kwhola Sothar Gaunpalika,Kwholasothar Gaunpalika
Laligurans Municipality,Laliguras Municipality
Lamahi Municipality,Lamhi Municipality
Lamki Chuha Municipality,Lamkichuha Nagarpalika
Laxminiya Gaunpalika,Lakshminiya Gaunpalika
Laxmipur Patari Gaunpalika,Laxmi Patari Gaunpalika
Lekabeshi Municipality,Lekbeshi Municipality
Likhu Gaunpalika,Likhu Tamakoshi Gaunpalika
Likhu Pike Gaunpalika,Likhupike Gaunpalika
Lisankhu Pakhar Gaunpalika,Lisangkhu Pakhar Gaunpalika
Madhya Bindu Municipality,Madhyabindu Municipality
Madhya Nepal Municipality,MadhyaNepal Municipality
Maharajganj Municipality,Maharajgunj Municipality
Mai Jogmai Gaunpalika,Maijogmai Gaunpalika
Makawanpurgadhi Gaunpalika,Makwanpurgadhi Gaunpalika
Manara Shisawa Municipality,Manra Siswa Municipality
Mandan Deupur Municipality,Mandandeupur Municipality
Mandavi Gaunpalika,Mandawi Gaunpalika
Marshyangdi Gaunpalika,Marsyangdi Gaunpalika
Melanchi Municipality,Melamchi Municipality
Menchhayayem Gaunpalika,Menchayam Gaunpalika
Miklajung Gaunpalika,Miklajunga Gaunpalika
Mugumakarmarog Gaunpalika,Mugum Karmarong Gaunpalika
Mukhiyapatti Musaharmiya Gaunpalika,Mukhiyapatti Musarmiya Gaunpalika
Naraha Gaunpalika,Narha Gaunpalika
Naraphu Gaunpalika,Narphu Gaunpalika
Necha Salyan Gaunpalika,Nechasalyan Gaunpalika
Nijagadh Municipality,Nijgadh Municipality
Nilkhantha Municipality,Nilakantha Municipality
Om Satiya Gaunpalika,Omsatiya Gaunpalika
Pachal Jharana Gaunpalika,Pachaljharana Gaunpalika
Paiyu Gaunpalika,Painyu Gaunpalika
Pakaha Mainpur Gaunpalika,Pakahamainpur Gaunpalika
Panchapuri Municipality,Panchpuri Municipality
Panchdebal Binayak Municipality,Panchadewal Binayak Municipality
Pancheshwor Gaunpalika,Pancheshwar Gaunpalika
Pandab Gufa Gaunpalika,Pandav Gupha Gaunpalika
Parawanipur Gaunpalika,Parwanipur Gaunpalika
Parbatikunda Gaunpalika,Parbati Kunda Gaunpalika
Patam Municipality,Patan Municipality
Paterwa Sugauli Gaunpalika,Paterwasugauli Gaunpalika
Pathari Shanishchare Municipality,Patahrishanishchare Municipality
Pauwa Dunma Gaunpalika,Pauwadungma Gaunpalika
Phaktanlung Gaunpalika,Phaktanglung Gaunpalika
Phalebas Municipality,Falebas Municipality
Pipara Gaunpalika,Pipra Gaunpalika
Pratapapur Gaunpalika,Pratappur Gaunpalika
Puchaundi Municipality,Purchaudi Municipality
Purbichouki Gaunpalika,Purbichauki Gaunpalika
Putha Uttanganga Gaunpalika,Putha Uttarganga Gaunpalika
Rainadevi Chhahara Gaunpalika,Rainadevi Chahara Gaunpalika
Raksirang Gaunpalika,Rakshirang Gaunpalika
Ram Gopalpur Municipality,Ramgopalpur Municipality
Rapti Sonari Gaunpalika,Raptisonari Gaunpalika
Rhishing Gaunpalika,Rhising Gaunpalika
Salpa Silichho Gaunpalika,Salpasilichho Gaunpalika
Sangurigadhi Gaunpalika,Sagurigadhi Gaunpalika
Sanibheri Gaunpalika,Sani Bheri Gaunpalika
Satyawoti Gaunpalika,Satyawati Gaunpalika
Shahid Lakhan Gaunpalika,Sahid Lakhan Gaunpalika
Shahidnagar Municipality,Sahidnagar Municipality
Shailung Gaunpalika,Sailung Gaunpalika
Sharada Municipality,Sarada Municipality
Shey Phoksundo Gaunpalika,She Foksundo Gaunpalika
Shitaganga Municipality,Sitganga Municipality
Shivalaya Gaunpalika,Shiwalaya Gaunpalika
Shivaraj Municipality,Shivraj Municipality
Shivasatakshi Municipality,Shivasataxi Municipality
Suddhodhan Gaunpalika,Sudhdhodhan Gaunpalika
Shuklaphanta Municipality,Suklaphata Municipality
Simroungadh Municipality,Simraungadh Municipality
Siranchowk Gaunpalika,Siranchok Gaunpalika
Sirijanga Gaunpalika,Sirijangha Gaunpalika
Solu Dhudhakunda Municipality,Solududhakunda Municipality
Subarna Gaunpalika,Suwarna Gaunpalika
Subarnabati Gaunpalika,Suwarnabati Gaunpalika
Sunawal Municipality,Sunwal Municipality
Sundarharaicha Municipality,Sundarharicha Municipality
Sunkoshi Gaunpalika,Sukoshi Gaunpalika
Sunwarshi Municipality,Sunawarshi Municipality
Susta Gaunpalika,Tribenisusta Gaunpalika
Tarakeshwor Gaunpalika,Tarkeshwar Gaunpalika
Thori Gaunpalika,Subarnapur Gaunpalika
Thulibheri Municipality,Thuli Bheri Municipality
Tilagupha Municipality,Tilagufa Municipality
Tilottama Municipality,Tillotama Municipality
Tribeni Gaunpalika,Triveni Gaunpalika
Turmakhand Gaunpalika,Turmakhad Gaunpalika
Tyamke Maiyum Gaunpalika,Tyamkemaiyung Gaunpalika
Urlabari Municipality,Uralabari Municipality
Walling Municipality,Waling Municipality
Yangbarak Gaunpalika,Pathibhara Yangwarak Gaunpalika
Yasodhara Gaunpalika,Yashodhara Gaunpalika
Bhokraha Gaunpalika,Bhokraha Narsingh Gaunpalika
Kepilasgadhi Gaunpalika,Kepilasagadhi Gaunpalika
Lamidanda Gaunpalika,Rawa Besi Gaunpalika
Balan-Bihul Gaunpalika,Balan Bihul Gaunpalika
Mahadewa Gaunpalika,Mahadeva Gaunpalika
Sakhuwa Nankarkatti Gaunpalika,Sakhuwanankarkatti Gaunpalika
Ghyanglekha Gaunpalika,Ghanglekh Gaunpalika
Khaniyabas Gaunpalika,Khaniyabash Gaunpalika
Netrawati Gaunpalika,Netrawati Dabjong Gaunpalika
Tripurasundari Gaunpalika,Tripura Sundari Gaunpalika
Yamunamai Gaunpalika,Yemunamai Gaunpalika
Sakhuwa Prasauni Gaunpalika,SakhuwaPrasauni Gaunpalika
Neshang Gaunpalika,Neshyang Gaunpalika
Dhawalagiri Gaunpalika,Dhaulagiri Gaunpalika
Kathekhola Gaunpalika,Kanthekhola Gaunpalika
Tamankhola Gaunpalika,Taman Khola Gaunpalika
Tarakhola Gaunpalika,Tara Khola Gaunpalika
Palhinandan Gaunpalika,Palhi Nandan Gaunpalika
Lumbini Sanskritik Municipality,Lumbini Sanskritik Development Area Municipality
Bhumikasthan Municipality,Bhumekasthan Municipality
Sworgadwari Municipality,Sworgadwary Municipality
Runtigadhi Gaunpalika,Runtigadi Gaunpalika
Kumakh Malika Gaunpalika,Kumakhmalika Gaunpalika
Janaki Gaunpalika,Janki Gaunpalika
Nepalganj Sub-Metropolitian City,Nepalgunj Upamahanagarpalika
Malikarjun Gaunpalika,Malikaarjun Gaunpalika
Patarasi Gaunpalika,Patrasi Gaunpalika
`)
);
display(alternateMunicipalityNames)
```

---

```js echo
const data = (() => {
  let data = localHouseholdLevelSheet.sheet("GP_Hhld_Table09", {
    range: "A3:"
  });

  let [_0, headers, _1, ...raw] = data;

  raw = raw.filter((o) => Object.keys(o).length !== 0);

  headers = Object.entries(headers).reduce((acc, [k, v]) => {
    return { ...acc, [k]: v.replace(/\s+/g, " ").replace("- ", "").trim() };
  }, {});

  delete headers["A"];
  delete headers["B"];
  delete headers["C"];
  delete headers["D"];

  const byProvince = [];
  const byDistrict = [];
  const byLocalLevel = [];
  let currentProvince;
  let currentDistrict;
  let distObj;

  const headersMap = new Map(Object.entries(headers));

  raw.forEach((r) => {
    const { A, B, C, D, ...rest } = r;
    // map province
    if (A) {
      currentProvince = A;
      byProvince.push({
        Province: currentProvince,
        ...translateKeys(rest, headersMap)
      });

      // push previous district data
      if (distObj) {
        byDistrict.push(distObj);
        distObj = undefined;
      }
    } else if (B) {
      currentDistrict = B;
    } else if (D === "Total") {
      byDistrict.push({
        Province: currentProvince,
        District: currentDistrict,
        ...translateKeys(rest, headersMap)
      });
    } else {
      byLocalLevel.push({
        Province: currentProvince,
        District: currentDistrict,
        Municipality: D,
        ...translateKeys(rest, headersMap)
      });
    }
  });

  return { byProvince, byDistrict, byLocalLevel, raw, headers };
})();
display(data)
```

```js echo
const localHouseholdLevelSheet = FileAttachment("Local-Household-Level.xlsx").xlsx()
```

```js echo
//import {translateKeys} from "@categorise/utils-objects"
import {translateKeys} from "/components/utils-objects.js";
display(translateKeys)
```
