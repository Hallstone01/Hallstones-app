import React, { useEffect, useState } from "react";
import { Bike, ChevronRight, Heart, Languages } from "lucide-react";
import { supabase } from "../supabaseClient";
import { Screen, Eyebrow, RoadDivider, LoadingRow, ErrorRow } from "./Screen";
import { GUNMETAL, GUNMETAL_2, BRASS, CHROME, INK } from "../theme";
import logo from "../assets/logo.jpg";

const TRANSLATIONS = {
  en: {
    title: "Hallstone Chapter",
    subtitle: "WIDOWS SONS MASONIC BIKERS ASSOC.",
    intro:
      "Hallstones is the Buckinghamshire chapter of the Widows Sons — riding together, raising money for Masonic charities, and supporting each other on and off the bike.",
    latest: "LATEST",
    noNotices: "No notices yet.",
    allNotices: "All notices",
    charityDonations: "CHARITY DONATIONS",
    noDonations: "No donations recorded yet.",
    couldntLoadNotices: "Couldn't load notices",
    couldntLoadDonations: "Couldn't load donations",
  },
  pl: {
    title: "Hallstone Chapter",
    subtitle: "STOWARZYSZENIE MOTOCYKLISTÓW MASOŃSKICH WIDOWS SONS",
    intro:
      "Hallstones to oddział Widows Sons w hrabstwie Buckinghamshire — jeździmy razem, zbieramy pieniądze na cele charytatywne i wspieramy się nawzajem na
