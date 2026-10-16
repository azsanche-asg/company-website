"use strict";
const notes = ["invoice-evidence", "invoice-research-title", "support-evidence", "support-research-title", "documentation-evidence", "documentation-research-title", "documentation-guarantee", "fundus-evidence", "oct-evidence", "cxr-research-title"];
const anchor = location.hash.slice(1);
if (notes.includes(anchor)) location.replace("walkthrough-notes.html#" + anchor);
if (anchor === "chest-xray") location.replace("studies/chexpert.html");
