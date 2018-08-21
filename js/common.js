function getRankInfo(recipe, chef, equip) {

    setDataForChef2(chef, equip);

    var times = Number.MAX_VALUE;

    if (recipe.stirfry > 0) {
        times = Math.min(times, chef.stirfryVal / recipe.stirfry);
    }
    if (recipe.boil > 0) {
        times = Math.min(times, chef.boilVal / recipe.boil);
    }
    if (recipe.knife > 0) {
        times = Math.min(times, chef.knifeVal / recipe.knife);
    }
    if (recipe.fry > 0) {
        times = Math.min(times, chef.fryVal / recipe.fry);
    }
    if (recipe.bake > 0) {
        times = Math.min(times, chef.bakeVal / recipe.bake);
    }
    if (recipe.steam > 0) {
        times = Math.min(times, chef.steamVal / recipe.steam);
    }

    var rankInfo = new Object();

    var rankAddition = 0;
    var rankDisp = "-";
    var rankVal = 0;

    if (times != Number.MAX_VALUE) {
        if (times >= 4) {
            rankAddition = 0.5;
            rankDisp = "神";
            rankVal = 4;
        } else if (times >= 3) {
            rankAddition = 0.3;
            rankDisp = "特";
            rankVal = 3;
        } else if (times >= 2) {
            rankAddition = 0.1;
            rankDisp = "优";
            rankVal = 2;
        } else if (times >= 1) {
            rankAddition = 0;
            rankDisp = "可";
            rankVal = 1;
        }
    }

    rankInfo["rankAddition"] = rankAddition;
    rankInfo["rankDisp"] = rankDisp;
    rankInfo["rankVal"] = rankVal;

    return rankInfo;
}

function getSkillAddition(recipe, skill) {
    var skillAddition = 0;
    for (var k in skill) {
        var hasSkill = false;
        if (skill[k].type.indexOf("水产料理售价") >= 0) {
            for (var m in recipe.materials) {
                if (recipe.materials[m].origin == "鱼塘") {
                    hasSkill = true;
                    break;
                }
            }
        } else if (skill[k].type.indexOf("面类料理售价") >= 0) {
            for (var m in recipe.materials) {
                if (recipe.materials[m].origin == "作坊") {
                    hasSkill = true;
                    break;
                }
            }
        } else if (skill[k].type.indexOf("肉类料理售价") >= 0) {
            for (var m in recipe.materials) {
                if (recipe.materials[m].origin == "牧场"
                    || recipe.materials[m].origin == "鸡舍"
                    || recipe.materials[m].origin == "猪圈") {
                    hasSkill = true;
                    break;
                }
            }
        } else if (skill[k].type.indexOf("蔬菜料理售价") >= 0) {
            for (var m in recipe.materials) {
                if (recipe.materials[m].origin == "菜棚"
                    || recipe.materials[m].origin == "菜地"
                    || recipe.materials[m].origin == "森林") {
                    hasSkill = true;
                    break;
                }
            }
        } else if (skill[k].type.indexOf("炒类料理售价") >= 0) {
            if (recipe.stirfry > 0) {
                hasSkill = true;
            }
        } else if (skill[k].type.indexOf("煮类料理售价") >= 0) {
            if (recipe.boil > 0) {
                hasSkill = true;
            }
        } else if (skill[k].type.indexOf("炸类料理售价") >= 0) {
            if (recipe.fry > 0) {
                hasSkill = true;
            }
        } else if (skill[k].type.indexOf("切类料理售价") >= 0) {
            if (recipe.knife > 0) {
                hasSkill = true;
            }
        } else if (skill[k].type.indexOf("烤类料理售价") >= 0) {
            if (recipe.bake > 0) {
                hasSkill = true;
            }
        } else if (skill[k].type.indexOf("蒸类料理售价") >= 0) {
            if (recipe.steam > 0) {
                hasSkill = true;
            }
        } else if (skill[k].type.indexOf("金币获得") >= 0) {
            hasSkill = true;
        } else if (skill[k].type.indexOf("营业收入") >= 0) {
            hasSkill = true;
        }

        if (hasSkill) {
            skillAddition = skillAddition.add(skill[k].addition);
        }
    }

    return skillAddition;
}

function getMaterialsAddition(recipe, materials) {
    var addition = 0;

    for (var m in recipe.materials) {
        for (var n in materials) {
            if (recipe.materials[m].material == materials[n].materialId) {
                if (materials[n].addition) {
                    addition = addition.add(Number(materials[n].addition));
                    break;
                }
            }
        }
    }
    return addition;
}

function getAdditionDisp(addition) {
    if (addition) {
        return addition.mul(100) + "%";
    } else {
        return "";
    }
}

function getRecipeQuantity(recipe, materials, rule) {
    var quantity = 1;
    if (!rule.hasOwnProperty("DisableMultiCookbook") || rule.DisableMultiCookbook == false) {
        quantity = recipe.limitVal;
    }

    for (var m in recipe.materials) {
        var exist = false;
        for (var n in materials) {
            if (recipe.materials[m].material == materials[n].materialId) {
                exist = true;
                if (materials[n].quantity) {
                    var tt = Math.floor(materials[n].quantity / recipe.materials[m].quantity);
                    if (tt < quantity) {
                        quantity = tt;
                    }
                    break;
                } else if (materials[n].quantity === 0) {
                    return 0;
                }
            }
        }
        if (!exist) {
            return 0;
        }
    }

    if (quantity < 0) {
        return 0;
    }

    return quantity;
}

function getRecipeResult(chef, equip, recipe, quantity, maxQuantity, materials, rule, decoration) {

    var resultData = new Object();

    var rankAddition = 0;
    var chefSkillAddition = 0;
    var equipSkillAddition = 0;
    var decorationAddition = 0;
    var otherAddition = 0;

    var timeAddition = 0;

    resultData["disp"] = recipe.name;

    if (chef) {
        var rankData = getRankInfo(recipe, chef, equip);
        resultData["rankVal"] = rankData.rankVal;
        resultData["rankDisp"] = rankData.rankDisp;

        if (rankData.rankVal == 0) {
            return resultData;
        }

        if (!rule || !rule.hasOwnProperty("DisableCookbookRank") || rule.DisableCookbookRank == false) {
            rankAddition = rankData.rankAddition;
        }

        resultData["rankAddition"] = rankAddition;
        resultData["rankAdditionDisp"] = getAdditionDisp(rankAddition);

        if (!rule || !rule.hasOwnProperty("DisableChefSkillEffect") || rule.DisableChefSkillEffect == false) {
            chefSkillAddition = getSkillAddition(recipe, chef.specialSkillEffect);
            timeAddition = timeAddition.add(getTimeAddition(chef.specialSkillEffect));
        }

        resultData["chefSkillAddition"] = chefSkillAddition;
        resultData["chefSkillAdditionDisp"] = getAdditionDisp(chefSkillAddition);

        if (!rule || !rule.hasOwnProperty("DisableEquipSkillEffect") || rule.DisableEquipSkillEffect == false) {
            if (equip) {
                equipSkillAddition = getSkillAddition(recipe, equip.effect);
                timeAddition = timeAddition.add(getTimeAddition(equip.effect));
            }
        }

        resultData["equipSkillAddition"] = equipSkillAddition;
        resultData["equipSkillAdditionDisp"] = getAdditionDisp(equipSkillAddition);

        otherAddition = otherAddition.add(Number(chef.addition));
    }

    if (!rule || !rule.hasOwnProperty("DisableDecorationEffect") || rule.DisableDecorationEffect == false) {
        if (decoration) {
            decorationAddition = decoration;
        }
    }
    resultData["decorationAddition"] = decorationAddition;
    resultData["decorationAdditionDisp"] = getAdditionDisp(decorationAddition);

    otherAddition = otherAddition.add(Number(recipe.addition));

    if (rule) {
        var materialsAddition = getMaterialsAddition(recipe, materials);
        otherAddition = otherAddition.add(materialsAddition);
    }

    var priceAddition = Number(1).add(rankAddition).add(chefSkillAddition).add(equipSkillAddition).add(decorationAddition).add(recipe.ultimateAddition);
    var scoreAddition = priceAddition.add(otherAddition);

    resultData["data"] = recipe;
    resultData["quantity"] = quantity;
    resultData["max"] = maxQuantity;
    resultData["limit"] = quantity;
    resultData["otherAddition"] = otherAddition;
    resultData["otherAdditionDisp"] = getAdditionDisp(otherAddition);
    resultData["totalPrice"] = recipe.price * quantity;
    resultData["realPrice"] = Math.ceil(recipe.price.mul(priceAddition));
    resultData["totalRealPrice"] = resultData.realPrice * quantity;
    var score = Math.ceil(recipe.price.mul(scoreAddition));
    resultData["bonusScore"] = score - resultData.realPrice;
    resultData["totalBonusScore"] = resultData.bonusScore * quantity;
    resultData["totalScore"] = score * quantity;
    resultData["totalTime"] = Math.ceil(recipe.time.mul(Number(1).add(timeAddition))) * quantity;
    resultData["totalTimeDisp"] = secondsToTime(resultData.totalTime);

    var chefEff = 0;
    if (chef && resultData.rankVal > 0) {
        chefEff = Math.floor(resultData.realPrice * 3600 / (recipe.time * (1 + timeAddition)));
    }
    resultData["chefEff"] = chefEff;

    return resultData;
}

function getTimeAddition(skill) {
    var timeAddition = 0;
    for (var k in skill) {
        if (skill[k].type.indexOf("开业时间") >= 0) {
            timeAddition += skill[k].addition;
        }
    }
    return timeAddition;
}

function secondsToTime(sec) {
    sec = Number(sec);

    var d = Math.floor(sec / 3600 / 24);
    var h = Math.floor(sec / 3600 % 24);
    var m = Math.floor(sec / 60 % 60);
    var s = Math.floor(sec % 60);

    var ret = "";
    if (d > 0) {
        ret += d + "天";
    }
    if (h > 0) {
        ret += h + "小时";
    }
    if (m > 0) {
        ret += m + "分";
    }
    if (s > 0) {
        ret += s + "秒";
    }

    return ret;
}

function getEquipInfo(equipName, equips) {
    var info = new Object();
    if (equipName) {
        for (var j in equips) {
            if (equipName == equips[j].name) {
                info["name"] = equips[j].name;
                info["effect"] = equips[j].effect;
                info["disp"] = equips[j].name + "<br><small>" + equips[j].skillDisp + "</small>";
                break;
            }
        }
    }
    return info;
}

function setDataForChef2(chef, equip) {
    chef["stirfryVal"] = chef.stirfry;
    chef["boilVal"] = chef.boil;
    chef["knifeVal"] = chef.knife;
    chef["fryVal"] = chef.fry;
    chef["bakeVal"] = chef.bake;
    chef["steamVal"] = chef.steam;

    chef["stirfryDisp"] = chef.stirfry || "";
    chef["boilDisp"] = chef.boil || "";
    chef["knifeDisp"] = chef.knife || "";
    chef["fryDisp"] = chef.fry || "";
    chef["bakeDisp"] = chef.bake || "";
    chef["steamDisp"] = chef.steam || "";

    var stirfryAddition = chef.stirfryUltimateAddition;
    var boilAddition = chef.boilUltimateAddition;
    var knifeAddition = chef.knifeUltimateAddition;
    var fryAddition = chef.fryUltimateAddition;
    var bakeAddition = chef.bakeUltimateAddition;
    var steamAddition = chef.steamUltimateAddition;

    if (equip) {
        var effect = equip.effect;
        for (var i in effect) {
            var type = effect[i].type;
            var addition = effect[i].addition;
            if (type.indexOf("炒技法") >= 0
                || type.indexOf("全技法") >= 0) {
                if (isInt(addition)) {
                    stirfryAddition += addition;
                } else {
                    stirfryAddition += chef.stirfry * addition;
                }
            }
            if (type.indexOf("煮技法") >= 0
                || type.indexOf("全技法") >= 0) {
                if (isInt(addition)) {
                    boilAddition += addition;
                } else {
                    boilAddition += chef.boil * addition;
                }
            }
            if (type.indexOf("切技法") >= 0
                || type.indexOf("全技法") >= 0) {
                if (isInt(addition)) {
                    knifeAddition += addition;
                } else {
                    knifeAddition += chef.knife * addition;
                }
            }
            if (type.indexOf("炸技法") >= 0
                || type.indexOf("全技法") >= 0) {
                if (isInt(addition)) {
                    fryAddition += addition;
                } else {
                    fryAddition += chef.fry * addition;
                }
            }
            if (type.indexOf("烤技法") >= 0
                || type.indexOf("全技法") >= 0) {
                if (isInt(addition)) {
                    bakeAddition += addition;
                } else {
                    bakeAddition += chef.bake * addition;
                }
            }
            if (type.indexOf("蒸技法") >= 0
                || type.indexOf("全技法") >= 0) {
                if (isInt(addition)) {
                    steamAddition += addition;
                } else {
                    steamAddition += chef.steam * addition;
                }
            }
        }
    }

    if (stirfryAddition) {
        stirfryAddition = Math.ceil(stirfryAddition)
        chef.stirfryVal += stirfryAddition;
        if (stirfryAddition > 0) {
            chef.stirfryDisp += "+";
        } else {
            chef.stirfryDisp += "";
        }
        chef.stirfryDisp += stirfryAddition;
    }
    if (boilAddition) {
        boilAddition = Math.ceil(boilAddition)
        chef.boilVal += boilAddition;
        if (boilAddition > 0) {
            chef.boilDisp += "+";
        } else {
            chef.boilDisp += "";
        }
        chef.boilDisp += boilAddition;
    }
    if (knifeAddition) {
        knifeAddition = Math.ceil(knifeAddition)
        chef.knifeVal += knifeAddition;
        if (knifeAddition > 0) {
            chef.knifeDisp += "+";
        } else {
            chef.knifeDisp += "";
        }
        chef.knifeDisp += knifeAddition;
    }
    if (fryAddition) {
        fryAddition = Math.ceil(fryAddition)
        chef.fryVal += fryAddition;
        if (fryAddition > 0) {
            chef.fryDisp += "+";
        } else {
            chef.fryDisp += "";
        }
        chef.fryDisp += fryAddition;
    }
    if (bakeAddition) {
        bakeAddition = Math.ceil(bakeAddition)
        chef.bakeVal += bakeAddition;
        if (bakeAddition > 0) {
            chef.bakeDisp += "+";
        } else {
            chef.bakeDisp += "";
        }
        chef.bakeDisp += bakeAddition;
    }
    if (steamAddition) {
        steamAddition = Math.ceil(steamAddition)
        chef.steamVal += steamAddition;
        if (steamAddition > 0) {
            chef.steamDisp += "+";
        } else {
            chef.steamDisp += "";
        }
        chef.steamDisp += steamAddition;
    }

    chef["disp"] = chef.name + "<br><small>";
    var count = 0;
    if (chef.stirfryDisp) {
        chef.disp += "炒" + chef.stirfryDisp + " ";
        count++;
    }
    if (chef.boilDisp) {
        chef.disp += "煮" + chef.boilDisp + " ";
        count++;
        if (count % 2 == 0) {
            chef.disp += "<br>";
        }
    }
    if (chef.knifeDisp) {
        chef.disp += "切" + chef.knifeDisp + " ";
        count++;
        if (count % 2 == 0) {
            chef.disp += "<br>";
        }
    }
    if (chef.fryDisp) {
        chef.disp += "炸" + chef.fryDisp + " ";
        count++;
        if (count % 2 == 0) {
            chef.disp += "<br>";
        }
    }
    if (chef.bakeDisp) {
        chef.disp += "烤" + chef.bakeDisp + " ";
        count++;
        if (count % 2 == 0) {
            chef.disp += "<br>";
        }
    }
    if (chef.steamDisp) {
        chef.disp += "蒸" + chef.steamDisp + " ";
    }
    chef.disp += "</small>"
}

function isInt(n) {
    return n % 1 === 0;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function accAdd(arg1, arg2) {
    if (isNaN(arg1)) {
        arg1 = 0;
    }
    if (isNaN(arg2)) {
        arg2 = 0;
    }
    arg1 = Number(arg1);
    arg2 = Number(arg2);
    var r1, r2, m, c;
    try {
        r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
        r2 = 0;
    }
    c = Math.abs(r1 - r2);
    m = Math.pow(10, Math.max(r1, r2));
    if (c > 0) {
        var cm = Math.pow(10, c);
        if (r1 > r2) {
            arg1 = Number(arg1.toString().replace(".", ""));
            arg2 = Number(arg2.toString().replace(".", "")) * cm;
        } else {
            arg1 = Number(arg1.toString().replace(".", "")) * cm;
            arg2 = Number(arg2.toString().replace(".", ""));
        }
    } else {
        arg1 = Number(arg1.toString().replace(".", ""));
        arg2 = Number(arg2.toString().replace(".", ""));
    }
    return (arg1 + arg2) / m;
}

Number.prototype.add = function (arg) {
    return accAdd(this, arg);
};

function accSub(arg1, arg2) {
    if (isNaN(arg1)) {
        arg1 = 0;
    }
    if (isNaN(arg2)) {
        arg2 = 0;
    }
    arg1 = Number(arg1);
    arg2 = Number(arg2);

    var r1, r2, m, n;
    try {
        r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
        r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
}

Number.prototype.sub = function (arg) {
    return accSub(this, arg);
};

function accMul(arg1, arg2) {
    if (isNaN(arg1)) {
        arg1 = 0;
    }
    if (isNaN(arg2)) {
        arg2 = 0;
    }
    arg1 = Number(arg1);
    arg2 = Number(arg2);

    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try {
        m += s1.split(".")[1].length;
    }
    catch (e) {
    }
    try {
        m += s2.split(".")[1].length;
    }
    catch (e) {
    }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
}

Number.prototype.mul = function (arg) {
    return accMul(this, arg);
};

function accDiv(arg1, arg2) {
    if (isNaN(arg1)) {
        arg1 = 0;
    }
    if (isNaN(arg2)) {
        arg2 = 0;
    }
    arg1 = Number(arg1);
    arg2 = Number(arg2);

    var t1 = 0, t2 = 0, r1, r2;
    try {
        t1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
    }
    try {
        t2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
    }
    with (Math) {
        r1 = Number(arg1.toString().replace(".", ""));
        r2 = Number(arg2.toString().replace(".", ""));
        return (r1 / r2) * pow(10, t2 - t1);
    }
}

Number.prototype.div = function (arg) {
    return accDiv(this, arg);
};