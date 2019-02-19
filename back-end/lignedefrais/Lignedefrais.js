var db = require('../db');

var Lignedefrais = {
    getLignesdefraisFromIdNdf:function(data, callback)
    {
        return db.query(
            'SELECT av.id_ldf, av.id_ndf, av.id_mission, miss.id_chef, miss.nom_mission, av.libelle_ldf, av.montant_ldf, \
            av.date_ldf, stat.libelle as statut_ldf, av.commentaire_ldf, av.motif_refus, av.justif_ldf, \
            miss.date_mission, av.mission_passee, av.montant_estime, av.montant_avance \
            FROM t_ligne_de_frais_avance as av, t_mission as miss, t_statut as stat \
            WHERE av.id_ndf = ? AND av.id_mission = miss.id_mission AND av.id_statut = stat.id_statut \
            UNION \
            SELECT ldf.id_ldf, ldf.id_ndf, ldf.id_mission, miss.id_chef, miss.nom_mission, ldf.libelle_ldf, ldf.montant_ldf, \
            ldf.date_ldf, stat.libelle as statut_ldf, ldf.commentaire_ldf, ldf.motif_refus, ldf.justif_ldf, \
            miss.date_mission, Null as mission_passee, Null as montant_estime, Null as montant_avance \
            FROM t_ligne_de_frais as ldf, t_mission as miss, t_statut as stat \
            WHERE ldf.id_ndf = ? AND ldf.id_mission = miss.id_mission AND ldf.id_statut = stat.id_statut', 
            [data.id, data.id], callback);
    },
    getMissionsCollabFormIdCollab:function(data,callback)
    {
        return db.query('SELECT miss.id_mission, miss.nom_mission FROM t_mission as miss, t_missionCollab as missC \
            WHERE missC.id_collab = ? AND missC.id_mission = miss.id_mission AND miss.ouverte = TRUE',
            [data.id], callback);
    },
    getMissionsCollabAvanceOrLignedefrais: function(data, callback)
    {
        date = new Date()
        return db.query('\
            SELECT miss.id_mission, miss.nom_mission, miss.date_mission, miss.ouverte, col.nom_collab, \
            col.prenom_collab, miss.id_chef, 1 as avance \
            FROM t_mission as miss, t_missionCollab as missc, t_collaborateur as col \
            WHERE miss.id_mission = missc.id_mission AND missc.id_collab = col.id_collab \
            AND miss.date_mission >= ? AND miss.ouverte = 1 AND col.id_collab = ? \
            UNION \
            SELECT miss.id_mission, miss.nom_mission, miss.date_mission, miss.ouverte, col.nom_collab, \
            col.prenom_collab, miss.id_chef, 0 as avance \
            FROM t_mission as miss, t_missionCollab as missc, t_collaborateur as col \
            WHERE miss.id_mission = missc.id_mission AND missc.id_collab = col.id_collab \
            AND miss.date_mission < ? AND miss.ouverte = 1 AND col.id_collab = ?;',
            [date, data.id, date, data.id], callback);
    },
    createLignedefrais: function (data, callback) {
        date = new Date();
        return db.query('INSERT INTO t_ligne_de_frais(id_ndf, id_mission, libelle_ldf, montant_ldf, \
            commentaire_ldf, date_ldf, id_statut, motif_refus, justif_ldf) \
            VALUES(?, ?, ?, ?, ?, ?, \
                (SELECT id_statut FROM t_statut WHERE libelle = ?), \'\', NULL)', 
            [data.id_ndf, data.id_mission, data.libelle, data.montant, data.commentaire, date, 'noSent'], callback);
    },
    createAvance: function (data, callback) {
        date = new Date();
        return db.query('INSERT INTO t_ligne_de_frais_avance(id_ndf, id_mission, libelle_ldf, \
            montant_ldf, montant_estime, montant_avance, commentaire_ldf, date_ldf, id_statut, \
            motif_refus, justif_ldf, mission_passee) \
            VALUES(?, ?, ?, 0, ?, ?, ?, ?, 1, \'\', NULL, FALSE)', 
            [data.id_ndf, data.id_mission, data.libelle, data.montant, data.montant, data.commentaire, date], callback);
    },
    deleteLignedefrais: function (data, callback) {
        return db.query('DELETE from t_ligne_de_frais WHERE id_ldf = ?', [data.id], callback);
    },
    updateLignedefrais: function (data, callback) {
        var sql = 'UPDATE t_ligne_de_frais SET libelle_ldf = ?, montant_ldf = ?, id_statut = \
        (SELECT id_statut FROM t_statut WHERE libelle = ?), commentaire_ldf = ?, \
        motif_refus = ? WHERE id_ldf = ?';
        return db.query(sql, [data.libelle, data.montant, "noSent", data.commentaire, "", data.id_ldf], callback);
    },
    updateLignedefraisAvance: function (data, callback) {
        var sql = 'UPDATE t_ligne_de_frais_avance SET libelle_ldf = ?, montant_ldf = ?, id_statut =  \
        (SELECT id_statut FROM t_statut WHERE libelle = ?), commentaire_ldf = ?, \
        motif_refus = ?, montant_estime = ?, montant_avance = ? \
        WHERE id_ldf = ?';
        return db.query(sql, 
            [data.libelle, data.montant, data.status, data.commentaire, "",
            data.montant_estime, data.montant_avance, data.id_ldf], callback);
    },
    deleteAvance: function(data, callback) {
        return db.query('DELETE from t_ligne_de_frais_avance WHERE id_ldf = ?', [data.id], callback);
    },
    updateStatutLignedefrais: function (data, callback) {
        var sql = 'UPDATE t_ligne_de_frais SET id_statut = \
        (SELECT id_statut FROM t_statut WHERE libelle = ?) WHERE id_ldf = ?';
        return db.query(sql, 
            [data.statut, data.id], callback);
    },
    updateStatutAvance: function (data, callback) {
        var sql = 'UPDATE t_ligne_de_frais_avance SET id_statut = \
        (SELECT id_statut FROM t_statut WHERE libelle = ?) WHERE id_ldf = ?';
        return db.query(sql, 
            [data.statut, data.id], callback);
    },
    updateStatutGlobal: function(data, callback) {
        var id_ndf = data.liste[0].id_ndf;
        //console.log(data);
        var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        date =  [year, month, day].join('-');
        var sql = '';
        var isCds = false;
        if(data.liste.length > 0) {
            data.liste.forEach(element => {
                if(element.avance) {
                    if(element.stat == 2 || element.stat == 8)
                        isCds = true;
                    if(element.stat > 5) {
                        sql += 'UPDATE t_ligne_de_frais_avance SET id_statut = ' + element.stat +
                        ' WHERE id_ldf = ' + element.id + ';\n';
                    }
                    else {
                        sql += 'UPDATE t_ligne_de_frais_avance SET id_statut = ' + element.stat +
                        ', montant_avance = ' + element.montant_avance + 
                        ' WHERE id_ldf = ' + element.id + ';\n';
                    }
                }
                else {
                    if(element.stat == 8)
                        isCds = true;
                    sql += 'UPDATE t_ligne_de_frais SET id_statut = ' + element.stat + 
                        ' WHERE id_ldf = ' + element.id + ';\n';
                }
            });
            if(data.listeCds.length > 0) {
                data.listeCds.forEach( element => {
                    sql += 'INSERT INTO t_notif_ndf(id_ndf, id_cds, date, nb_lignes, avance) \
                        VALUES( ' + id_ndf + ', ' + element + ', \'' + date + '\', ( \
                        SELECT COUNT(*) as nb \
                        FROM t_ligne_de_frais_avance as ldf, t_mission as miss \
                        WHERE ldf.id_ndf = ' + id_ndf + ' AND (ldf.id_statut = 3 OR ldf.id_statut = 7) \
                        AND miss.id_mission = ldf.id_mission AND miss.id_chef = ' + element + '), 1) \
                        ON DUPLICATE KEY UPDATE \
                        nb_lignes = VALUES(nb_lignes), \
                        date = VALUES(date) ;'
                    sql += 'INSERT INTO t_notif_ndf(id_ndf, id_cds, date, nb_lignes, avance) \
                        VALUES( ' + id_ndf + ', ' + element + ', \'' + date + '\', ( \
                        SELECT COUNT(*) as nb \
                        FROM t_ligne_de_frais as ldf, t_mission as miss \
                        WHERE ldf.id_ndf = ' + id_ndf + ' AND ldf.id_statut = 7 \
                        AND miss.id_mission = ldf.id_mission AND miss.id_chef = ' + element + '), 0) \
                        ON DUPLICATE KEY UPDATE \
                        nb_lignes = VALUES(nb_lignes), \
                        date = VALUES(date) ;'
                })
            }
            if(isCds) {
                sql += 'INSERT INTO t_notif_ndf_to_compta(id_ndf, date, avance, nb_lignes) \
                    VALUES( ' + id_ndf + ', \'' + date + '\', 1, ( \
                    SELECT COUNT(*) as nb \
                    FROM t_ligne_de_frais_avance as ldf \
                    WHERE id_ndf = ' + id_ndf + ' \
                    AND (ldf.id_statut = 8 OR ldf.id_statut = 2) ) ) \
                    ON DUPLICATE KEY UPDATE \
                    nb_lignes = VALUES(nb_lignes), \
                    date = VALUES(date) ; \
                    \
                    INSERT INTO t_notif_ndf_to_compta(id_ndf, date, avance, nb_lignes) \
                    VALUES( ' + id_ndf + ', \'' + date + '\', 0, ( \
                    SELECT COUNT(*) as nb \
                    FROM t_ligne_de_frais as ldf \
                    WHERE  ldf.id_statut = 8 AND id_ndf = ' + id_ndf + ') ) \
                    ON DUPLICATE KEY UPDATE \
                    nb_lignes = VALUES(nb_lignes), \
                    date = VALUES(date) ;'
            }
        }
        sql += 'UPDATE t_note_de_frais as ndf SET ndf.total = \
        (SELECT SUM(av.montant_ldf - av.montant_avance) \
            FROM t_ligne_de_frais_avance as av \
            WHERE av.id_ndf = ' + id_ndf + ' ) \
        + (SELECT SUM(av.montant_ldf) \
            FROM t_ligne_de_frais as av \
            WHERE av.id_ndf = ' + id_ndf + ') \
        WHERE ndf.id_ndf = ' + id_ndf + ';';
        sql += 'UPDATE t_notif_ndf_from_compta SET nb_lignes = \
        (SELECT COUNT(*) as nb \
        FROM t_ligne_de_frais_avance as ldf \
        WHERE ldf.id_ndf = ' + id_ndf + ' \
        AND (ldf.id_statut = 4 OR ldf.id_statut = 5 OR ldf.id_statut = 9 OR ldf.id_statut = 10) ) \
        WHERE id_ndf = ' + id_ndf + ' AND acceptee = 0 AND avance = 1 ; '
        sql += 'UPDATE t_notif_ndf_from_compta SET nb_lignes = \
        (SELECT COUNT(*) as nb \
        FROM t_ligne_de_frais as ldf \
        WHERE ldf.id_ndf = ' + id_ndf + ' \
        AND (ldf.id_statut = 9 OR ldf.id_statut = 10) ) \
        WHERE id_ndf = ' + id_ndf + ' AND acceptee = 0 AND avance = 0 ; '
        //console.log(sql)
        return db.query(sql, callback);
    },
    deleteAndCreateAvance: function(data, callback) {
        var id_ndf = data.liste[0].id_ndf;
        var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        date =  [year, month, day].join('-');
        var sql = ''
        if(data.liste.length > 0) {
            data.liste.forEach(element => {
                sql += 'DELETE from t_ligne_de_frais WHERE id_ldf = ' + element.id + ';\n';
                sql += 'INSERT INTO t_ligne_de_frais_avance(id_ndf, id_mission, libelle_ldf, montant_ldf, \
                    montant_estime, montant_avance, commentaire_ldf, date_ldf, id_statut, motif_refus, \
                    justif_ldf, mission_passee) \
                    VALUES(' + element.id_ndf + ' ,' + element.id_mission + ' ,\'' + element.libelle + '\' \
                    , 0, ' + element.montant_estime + ', ' + element.montant_avance + ' ,\'' +
                    element.commentaire + '\' ,\'' + date + '\' , 3, \'\', NULL, TRUE);\n';
            });
        }
        if(data.listeCds.length > 0) {
            data.listeCds.forEach( element => {
                sql += 'INSERT INTO t_notif_ndf(id_ndf, id_cds, date, nb_lignes, avance) \
                VALUES( ' + id_ndf + ', ' + element + ', \'' + date + '\', ( \
                SELECT COUNT(*) as nb \
                FROM t_ligne_de_frais_avance as ldf, t_mission as miss \
                WHERE ldf.id_ndf = ' + id_ndf + ' AND (ldf.id_statut = 3 OR ldf.id_statut = 7) \
                    AND miss.id_mission = ldf.id_mission AND miss.id_chef = ' + element + '), 1) \
                ON DUPLICATE KEY UPDATE \
                nb_lignes = VALUES(nb_lignes), \
                date = VALUES(date) ;'
            })
        }
        return db.query(sql, callback);
    },

}

module.exports = Lignedefrais;