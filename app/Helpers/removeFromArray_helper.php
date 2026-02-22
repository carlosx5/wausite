<?php

function removeFromArray($myArray, $myRemove)
{
    while (-1) {
        if (($key = array_search($myRemove, $myArray)) !== false) {
            unset($myArray[$key]);
        } else {
            break;
        }
    }

    return $myArray;
}