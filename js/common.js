function getRankInfo(recipe, chef) {

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
            rankAddition = 50;
            rankDisp = "神";
            rankVal = 4;
        } else if (times >= 3) {
            rankAddition = 30;
            rankDisp = "特";
            rankVal = 3;
        } else if (times >= 2) {
            rankAddition = 10;
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

function getRecipeSkillAddition(effects, recipe) {
    var addition = 0;
    for (var k in effects) {
        var type = effects[k].type;
        var hasSkill = false;
        if (type == "UseFish") {
            for (var m in recipe.materials) {
                if (recipe.materials[m].origin == "池塘") {
                    hasSkill = true;
                    break;
                }
            }
        } else if (type == "UseCreation") {
            for (var m in recipe.materials) {
                if (recipe.materials[m].origin == "作坊") {
                    hasSkill = true;
                    break;
                }
            }
        } else if (type == "UseMeat") {
            for (var m in recipe.materials) {
                if (recipe.materials[m].origin == "牧场"
                    || recipe.materials[m].origin == "鸡舍"
                    || recipe.materials[m].origin == "猪圈") {
                    hasSkill = true;
                    break;
                }
            }
        } else if (type == "UseVegetable") {
            for (var m in recipe.materials) {
                if (recipe.materials[m].origin == "菜棚"
                    || recipe.materials[m].origin == "菜地"
                    || recipe.materials[m].origin == "森林") {
                    hasSkill = true;
                    break;
                }
            }
        } else if (type == "UseStirfry") {
            if (recipe.stirfry > 0) {
                hasSkill = true;
            }
        } else if (type == "UseBoil") {
            if (recipe.boil > 0) {
                hasSkill = true;
            }
        } else if (type == "UseFry") {
            if (recipe.fry > 0) {
                hasSkill = true;
            }
        } else if (type == "UseKnife") {
            if (recipe.knife > 0) {
                hasSkill = true;
            }
        } else if (type == "UseBake") {
            if (recipe.bake > 0) {
                hasSkill = true;
            }
        } else if (type == "UseSteam") {
            if (recipe.steam > 0) {
                hasSkill = true;
            }
        } else if (type == "Gold_Gain") {
            hasSkill = true;
        }

        if (hasSkill) {
            addition = addition.add(effects[k].value);
        }
    }
    return addition;
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

function getPercentDisp(percent) {
    if (percent) {
        return percent + "%";
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
    var bonusAddition = 0;

    var timeAddition = 0;

    resultData["disp"] = recipe.name;

    if (chef) {
        var rankData = getRankInfo(recipe, chef);
        resultData["rankVal"] = rankData.rankVal;
        resultData["rankDisp"] = rankData.rankDisp;

        if (rankData.rankVal == 0) {
            return resultData;
        }

        if (!rule || !rule.hasOwnProperty("DisableCookbookRank") || rule.DisableCookbookRank == false) {
            rankAddition = rankData.rankAddition;
        }

        resultData["rankAdditionDisp"] = getPercentDisp(rankAddition);

        if (!rule || !rule.hasOwnProperty("DisableChefSkillEffect") || rule.DisableChefSkillEffect == false) {
            chefSkillAddition = getRecipeSkillAddition(chef.specialSkillEffect, recipe);
            timeAddition = getTimeAddition(chef.specialSkillEffect);
        }
        resultData["chefSkillAdditionDisp"] = getPercentDisp(chefSkillAddition);

        if (!rule || !rule.hasOwnProperty("DisableEquipSkillEffect") || rule.DisableEquipSkillEffect == false) {
            if (equip) {
                equipSkillAddition = getRecipeSkillAddition(equip.effect, recipe);
                timeAddition = getTimeAddition(equip.effect);
            }
        }
        resultData["equipSkillAdditionDisp"] = getPercentDisp(equipSkillAddition);

        bonusAddition = bonusAddition.add(Number(chef.addition));
    }

    if (!rule || !rule.hasOwnProperty("DisableDecorationEffect") || rule.DisableDecorationEffect == false) {
        if (decoration) {
            decorationAddition = decoration;
        }
    }
    resultData["decorationAdditionDisp"] = getPercentDisp(decorationAddition);

    bonusAddition = bonusAddition.add(Number(recipe.addition));

    if (rule && rule.hasOwnProperty("MaterialsEffect") && rule.MaterialsEffect.length > 0) {
        var materialsAddition = getMaterialsAddition(recipe, materials);
        bonusAddition = bonusAddition.add(materialsAddition);
    }

    var priceAddition = rankAddition.add(chefSkillAddition).add(equipSkillAddition).add(decorationAddition).add(recipe.ultimateAddition);

    resultData["data"] = recipe;
    resultData["quantity"] = quantity;
    resultData["max"] = maxQuantity;
    resultData["limit"] = quantity;
    resultData["bonusAdditionDisp"] = getPercentDisp(bonusAddition.mul(100));
    resultData["totalPrice"] = recipe.price * quantity;
    resultData["realPrice"] = Math.ceil(recipe.price.mul(Number(1).add(priceAddition.div(100))));
    resultData["totalRealPrice"] = resultData.realPrice * quantity;
    var score = Math.ceil(recipe.price.mul(Number(1).add(priceAddition.div(100)).add(bonusAddition)));
    resultData["bonusScore"] = score - resultData.realPrice;
    resultData["totalBonusScore"] = resultData.bonusScore * quantity;
    resultData["totalScore"] = score * quantity;
    var realTime = Math.ceil(recipe.time.mul(Number(1).add(timeAddition.div(100))));
    resultData["totalTime"] = realTime * quantity;
    resultData["totalTimeDisp"] = secondsToTime(resultData.totalTime);

    var chefEff = 0;
    if (chef && resultData.rankVal > 0) {
        chefEff = Math.floor(resultData.realPrice * 3600 / realTime);
    }
    resultData["chefEff"] = chefEff;

    return resultData;
}

function calAddition(value, addition) {
    return value.mul(addition.percent).div(100).add(addition.abs);
}

function getTimeAddition(addition, effects) {
    var addition = 0;
    for (var k in effects) {
        if (effects[k].type == "OpenTime") {
            addition = addition.add(effects[k].value);
        }
    }
    return addition;
}

function setAddition(addition, effect) {
    if (effect.cal == "Abs") {
        addition.abs = addition.abs.add(effect.value);
    } else if (effect.cal == "Percent") {
        addition.percent = addition.percent.add(effect.value);
    }
}

function Addition() {
    this.abs = 0;
    this.percent = 0;
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
    var info = null;
    if (equipName) {
        for (var j in equips) {
            if (equipName == equips[j].name) {
                info = [];
                info["name"] = equips[j].name;
                info["effect"] = equips[j].effect;
                info["disp"] = equips[j].name + "<br><small>" + equips[j].skillDisp + "</small>";
                break;
            }
        }
    }
    return info;
}

function setDataForChef(chef, equip, useEquip, ultimateEffect) {
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

    var stirfryAddition = new Addition();
    var boilAddition = new Addition();
    var knifeAddition = new Addition();
    var fryAddition = new Addition();
    var bakeAddition = new Addition();
    var steamAddition = new Addition();

    var effects = ultimateEffect;

    if (useEquip && equip) {
        effects = effects.concat(equip.effect);
    }

    if (chef.ultimateSelfEffect) {
        effects = effects.concat(chef.ultimateSelfEffect);
    }

    for (var i in effects) {
        var type = effects[i].type;
        var gender = effects[i].gender;

        if (gender && gender != chef.gender) {
            continue;
        }

        if (type == "Stirfry") {
            setAddition(stirfryAddition, effects[i]);
        }
        if (type == "Boil") {
            setAddition(boilAddition, effects[i]);
        }
        if (type == "Knife") {
            setAddition(knifeAddition, effects[i]);
        }
        if (type == "Fry") {
            setAddition(fryAddition, effects[i]);
        }
        if (type == "Bake") {
            setAddition(bakeAddition, effects[i]);
        }
        if (type == "Steam") {
            setAddition(steamAddition, effects[i]);
        }
    }

    var stirfryAbs = Math.ceil(calAddition(chef.stirfry, stirfryAddition));
    var boilAbs = Math.ceil(calAddition(chef.boil, boilAddition));
    var knifeAbs = Math.ceil(calAddition(chef.knife, knifeAddition));
    var fryAbs = Math.ceil(calAddition(chef.fry, fryAddition));
    var bakeAbs = Math.ceil(calAddition(chef.bake, bakeAddition));
    var steamAbs = Math.ceil(calAddition(chef.steam, steamAddition));

    if (stirfryAbs) {
        chef.stirfryVal += stirfryAbs;
        chef.stirfryDisp += getChefAdditionDisp(stirfryAbs);
    }
    if (boilAbs) {
        chef.boilVal += boilAbs;
        chef.boilDisp += getChefAdditionDisp(boilAbs);
    }
    if (knifeAbs) {
        chef.knifeVal += knifeAbs;
        chef.knifeDisp += getChefAdditionDisp(knifeAbs);
    }
    if (fryAbs) {
        chef.fryVal += fryAbs;
        chef.fryDisp += getChefAdditionDisp(fryAbs);
    }
    if (bakeAbs) {
        chef.bakeVal += bakeAbs;
        chef.bakeDisp += getChefAdditionDisp(bakeAbs);
    }
    if (steamAbs) {
        chef.steamVal += steamAbs;
        chef.steamDisp += getChefAdditionDisp(steamAbs);
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

function getChefAdditionDisp(addition) {
    var disp = "";
    if (addition > 0) {
        disp += "+";
    }
    disp += addition;
    return disp;
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