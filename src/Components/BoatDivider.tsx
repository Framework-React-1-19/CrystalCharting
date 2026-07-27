import {
    Divider
} from "@mui/material";

export function BoatDivider(){
    return(
        <>
            <Divider 
                sx={{ 
                height: "2px",
                border: "none",
                position: "relative",
                overflow: "hidden",
                backgroundColor: "#bae6fd",
                my: 3,
                "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, #0284c7, transparent)",
                    animation: "wave 3s infinite linear",
                },
                "@keyframes wave": {
                    "0%": { left: "-100%" },
                    "100%": { left: "100%" }
                }
                }}
            />
        </>
    )
}