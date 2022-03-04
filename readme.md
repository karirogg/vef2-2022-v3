# Vefforritun 2 - Verkefni 3

Til þess að setja upp verkefnið skal keyra

```
createdb vef2-2022-v3
npm run setup
```

Í gefnum gagnagrunni er til notandi með notendanafn `admin` og lykilorð `1234567890` og ein skránin á hvern viðburð.

## Próf

Í prófunum eru tvenns konar próf. Eitt á test gagnagrunn, sem þarf að búa til með `createdb vef2-2022-v3-test`. Hin tegundin ef prófum eru próf á endapunktunum. Þessi próf eru framkvæmd á localhost með gagnagrunninn sem var búinn til í upphafi (að ofan). Það eru próf sem búa til notendur og skoða /users notendurna í users.test.js. Í events.test.js er farið í gegnum ferlið að skoða viðburði, búa til viðburð með nýjum notanda, skoða viburðinn, láta enn nýjan notanda skrá sig á þann viðburð og svo eyða viðburðinum. Þetta ætti ekki að hafa áhrif á events gagnagrunninn en ætti að búa til nokkra notendur.

## Hvernig á að kalla á vefþjónustuna með cURL

Til þess að kalla á vefþjónustuna með `GET` kalli er hægt að keyra eftirfarandi:

```
curl --request GET http://vef2-v3-kari.herokuapp.com/<Endapunktur>
```

Til þess að kalla á vefþjónustuna með `POST` kalli er hægt að keyra eftirfarandi:

```
curl --request POST http://vef2-v3-kari.herokuapp.com/<Endapunktur>
```

Ef á að innihalda Bearer token skal skrifa kall á forminu:

```
curl --request GET http://vef2-v3-kari.herokuapp.com/<Endapunktur>
  --header 'Authorization: Bearer <JWT-token>'
```

þar sem `<JWT-token>` er jwt token sem fékkst með innskráningu.

Til þess að láta kallið nota body skal skrifa kall á forminu

```
curl --request GET http://vef2-v3-kari.herokuapp.com/<Endapunktur> --header 'Authorization: Bearer <JWT-token>' --header 'Content-Type: application/json' --data '{ <data json> }'
```

Ef nota á fleiri en einn header, skal nota mörg `--header` flögg.

### Dæmi um köll

```
curl --request GET http://vef2-v3-kari.herokuapp.com/events/

curl --request POST http://vef2-v3-kari.herokuapp.com/users/login --header 'Content-Type: application/json' --data-raw '{"username": "admin","password": "1234567890"}'

curl --request GET http://vef2-v3-kari.herokuapp.com/users/me --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ2NDEzOTA5LCJleHAiOjE2NDY0MTc1MDl9.mKzTU2RgDHCFsn9Q0BsMvgtmMKW2nOXTCKhDawYWtiA'
```

Tokeninn sem var notaður í síðasta kallinu er tokeninn sem kall nr. 2 skilaði.
