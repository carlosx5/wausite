<?php

function icons_numbers($number)
{
    $arrayList = ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];

    if ($number == 'all') {
        return $arrayList;
    } else {
        return $arrayList[$number];
    };
}
