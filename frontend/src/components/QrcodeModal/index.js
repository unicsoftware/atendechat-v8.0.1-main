import React, { useEffect, useState, useContext } from "react";
import QRCode from "qrcode.react";
import toastError from "../../errors/toastError";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Dialog, DialogContent, Typography, Box, IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import api from "../../services/api";

import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    borderRadius: "24px",
    backgroundColor: theme.mode === "light" ? "#FFFFFF" : "#111827",
    color: theme.mode === "light" ? "#0F172A" : "#F8FAFC",
    padding: "28px 32px 32px 32px",
    maxWidth: "720px",
    width: "100%",
    boxShadow: theme.mode === "light"
      ? "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
      : "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    border: theme.mode === "light"
      ? "1px solid #E2E8F0"
      : "1px solid rgba(255, 255, 255, 0.1)",
    position: "relative",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    position: "relative",
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    fontSize: "1.45rem",
    color: theme.mode === "light" ? "#0F172A" : "#FFFFFF",
    textAlign: "center",
    width: "100%",
  },
  closeBtn: {
    position: "absolute",
    right: 0,
    top: 0,
    color: theme.mode === "light" ? "#94A3B8" : "#64748B",
    "&:hover": {
      color: theme.mode === "light" ? "#0F172A" : "#FFFFFF",
    },
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "24px",
    alignItems: "center",
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "1fr",
    },
  },
  instructionsCard: {
    backgroundColor: theme.mode === "light" ? "#F8FAFC" : "rgba(255, 255, 255, 0.04)",
    borderRadius: "16px",
    padding: "24px 24px",
    border: theme.mode === "light" ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  instructionText: {
    fontSize: "0.9rem",
    color: theme.mode === "light" ? "#334155" : "#CBD5E1",
    marginBottom: "12px",
    lineHeight: 1.5,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    "& strong": {
      color: theme.mode === "light" ? "#0F172A" : "#FFFFFF",
      fontWeight: 700,
    },
  },
  subBullet: {
    paddingLeft: "16px",
    margin: "4px 0 8px 0",
    fontSize: "0.85rem",
    color: theme.mode === "light" ? "#475569" : "#94A3B8",
    lineHeight: 1.5,
  },
  qrCard: {
    backgroundColor: theme.mode === "light" ? "#F8FAFC" : "rgba(255, 255, 255, 0.04)",
    borderRadius: "16px",
    padding: "24px",
    border: theme.mode === "light" ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  qrCodeWrapper: {
    backgroundColor: "#FFFFFF",
    padding: "16px",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const theme = useTheme();
  const [qrCode, setQrCode] = useState("");
  const { user, socket } = useContext(AuthContext);

  const fetchSession = async () => {
    if (!whatsAppId) return;

    try {
      const { data } = await api.get(`/whatsapp/${whatsAppId}`);
      setQrCode(data.qrcode);
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [whatsAppId]);

  useEffect(() => {
    if (!whatsAppId) return;
    const companyId = user.companyId;

    const onWhatsappData = (data) => {
      if (data.action === "update" && data.session.id === whatsAppId) {
        setQrCode(data.session.qrcode);
      }

      if (data.action === "update" && data.session.qrcode === "") {
        onClose();
      }
    };
    socket.on(`company-${companyId}-whatsappSession`, onWhatsappData);

    return () => {
      socket.off(`company-${companyId}-whatsappSession`, onWhatsappData);
    };
  }, [whatsAppId, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      PaperProps={{ className: classes.dialogPaper }}
      BackdropProps={{
        style: {
          backdropFilter: "blur(10px)",
          backgroundColor: theme.mode === "light" ? "rgba(15, 23, 42, 0.5)" : "rgba(0, 0, 0, 0.75)",
        },
      }}
    >
      {/* HEADER TITLE & CLOSE */}
      <Box className={classes.header}>
        <Typography className={classes.title}>
          Sincronize o AtendeChat com o seu Whatsapp!
        </Typography>
        <IconButton className={classes.closeBtn} onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* MAIN TWO-COLUMN CONTENT */}
      <DialogContent style={{ padding: 0, overflow: "visible" }}>
        <Box className={classes.contentGrid}>
          {/* LEFT INSTRUCTIONS COLUMN */}
          <Box className={classes.instructionsCard}>
            <Typography className={classes.instructionText}>
              <strong>1. Abra o WhatsApp em seu celular</strong>
            </Typography>
            <Box className={classes.subBullet}>
              • <strong>Android:</strong> Toque em <strong>Mais informações &gt; Aparelhos conectados</strong>
            </Box>
            <Box className={classes.subBullet}>
              • <strong>iPhone:</strong> Toque em <strong>Configurações &gt; Aparelhos conectados</strong>
            </Box>

            <Typography className={classes.instructionText} style={{ marginTop: 12 }}>
              <strong>2. Toque em Conectar um aparelho.</strong>
            </Typography>

            <Typography className={classes.instructionText} style={{ marginTop: 12 }}>
              <strong>3. Aponte o seu celular para esta tela para capturar o código gerado.</strong>
            </Typography>
          </Box>

          {/* RIGHT QR CODE COLUMN */}
          <Box className={classes.qrCard}>
            <Box className={classes.qrCodeWrapper}>
              {qrCode ? (
                <QRCode value={qrCode} size={200} level="M" />
              ) : (
                <Typography variant="body2" color="textSecondary" style={{ padding: "30px 10px", textAlign: "center" }}>
                  Aguardando geração do QR Code...
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(QrcodeModal);
