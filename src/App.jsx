import React, { useState } from "react";

const groups = {
  1: ["Scottie Scheffler", "Rory McIlroy", "Cameron Young"],
  2: ["Matt Fitzpatrick", "Justin Rose", "Collin Morikawa", "Tommy Fleetwood"],
  3: ["Russell Henley", "J.J. Spaun", "Xander Schauffele", "Chris Gotterup", "Robert MacIntyre"],
  4: ["Sepp Straka", "Ben Griffin", "Ludvig Åberg", "Hideki Matsuyama", "Justin Thomas"],
  5: ["Alex Noren", "Jacob Bridgeman", "Si Woo Kim", "Jon Rahm", "Harris English"],
  6: ["Patrick Reed", "Akshay Bhatia", "Tyrrell Hatton", "Viktor Hovland", "Min Woo Lee", "Maverick McNealy"],
  7: ["Bryson DeChambeau", "Keegan Bradley", "Sam Burns", "Ryan Gerard", "Patrick Cantlay"],
  8: ["Kurt Kitayama", "Shane Lowry", "Jake Knapp", "Nicolai Højgaard", "Jason Day"],
  9: ["Marco Penge", "Daniel Berger", "Michael Kim", "Aaron Rai", "Adam Scott", "Nico Echavarria", "Matt McCarty"],
  10: ["Sam Stevens", "Gary Woodland", "Kristoffer Reitan", "Corey Conners", "Jordan Spieth", "Brooks Koepka"],
  11: ["Michael Brennan", "Rickie Fowler", "Brian Harman", "Andrew Novak", "Ryan Fox", "Pierceson Coody"],
  12: ["Sami Välimäki", "Ryo Hisatsune", "David Puig", "Nick Taylor", "Rasmus Højgaard", "Michael Thorbjornsen"],
  13: ["Thomas Detry", "Harry Hall", "Bud Cauley", "Jayden Schaper", "Jordan Smith", "Max Greyserman", "Cameron Smith"],
  14: ["Matt Wallace", "Wyndham Clark", "Max Kieffer", "Casey Jarvis", "Aldrich Potgieter", "Sahith Theegala", "Alex Fitzpatrick", "Max Homa", "Billy Horschel", "Dustin Johnson", "Sungjae Im", "Haotong Li"]
};

function Fonts() {
  return (
    <>
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />

      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="true"
      />

      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Oswald:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      />
    </>
  );
}

function Header() {
  return (
    <div className="text-center">
      <div
        className="
          text-[#0a2d4f]
          leading-none
          font-black
        "
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(3.5rem,7vw,6rem)",
          letterSpacing: "-.03em",
          textShadow: "0 2px 10px rgba(255,255,255,.2)"
        }}
      >
        PGA
      </div>

      <div
        className="
          uppercase
          text-[#23442e]
          tracking-[.35em]
        "
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: "clamp(1rem,2vw,1.5rem)",
          fontWeight: 500
        }}
      >
        Championship
      </div>

      <div
        className="
          uppercase
          text-[#08274b]
          mt-5
          leading-[.9]
        "
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(4rem,10vw,8rem)",
          letterSpacing: ".02em",
          textShadow: `
            0 4px 20px rgba(0,0,0,.18),
            0 2px 0 rgba(255,255,255,.15)
          `
        }}
      >
        Fantasy Team
      </div>

      <div
        className="
          uppercase
          text-[#b89245]
          leading-none
          mt-1
        "
        style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 700,
          fontSize: "clamp(2rem,5vw,4rem)",
          letterSpacing: ".28em",
          textShadow: "0 2px 10px rgba(0,0,0,.12)"
        }}
      >
        Pick ’Em
      </div>
    </div>
  );
}

function PageShell({ children }) {
  return (
    <>
      <Fonts />

      <div className="min-h-screen bg-[#dddddd] p-6 md:p-10">
        <div
          className="
            max-w-6xl
            mx-auto
            rounded-[46px]
            overflow-hidden
            relative
            shadow-[0_30px_80px_rgba(0,0,0,.28)]
          "
        >
          <div
            className="absolute inset-0 bg-cover bg-center scale-[1.02]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?q=80&w=2400&auto=format&fit=crop')"
            }}
          />

          <div className="absolute inset-0 bg-black/8 backdrop-[blur(.5px)]" />

          <div className="relative z-10 px-5 md:px-12 py-10 md:py-14">
            <Header />

            {children}
          </div>
        </div>
      </div>
    </>
  );
}

function ConfirmationPage() {
  const submittedTeam = JSON.parse(
    sessionStorage.getItem("pgaSubmittedTeam") || "{}"
  );

  return (
    <PageShell>
      <div
        className="
          max-w-5xl
          mx-auto
          mt-10
          rounded-[28px]
          overflow-hidden
          shadow-[0_20px_70px_rgba(0,0,0,.35)]
          border
          border-white/20
        "
      >
        <div
          className="px-8 md:px-12 py-8 text-white text-center"
          style={{
            background:
              "linear-gradient(135deg,#0c281c 0%, #03251c 50%, #0b4b32 100%)"
          }}
        >
          <div
            className="uppercase tracking-[.12em]"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "clamp(2rem,5vw,4rem)",
              fontWeight: 700
            }}
          >
            Your Picks Are In
          </div>

          <div
            className="mt-4 text-white/90"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "1.25rem",
              fontWeight: 300
            }}
          >
            Your PGA Fantasy Team has been submitted.
          </div>
        </div>

        <div className="bg-[#f6f6f4] px-8 md:px-12 py-10">
          {!submittedTeam.name ? (
            <div
              className="text-center text-[#24342c]"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: "1.3rem"
              }}
            >
              No submitted picks were found on this device.
            </div>
          ) : (
            <>
              <div
                className="mb-8"
                style={{
                  fontFamily: "'Oswald', sans-serif"
                }}
              >
                <div
                  className="uppercase text-[#24342c] mb-2"
                  style={{
                    fontWeight: 700,
                    letterSpacing: ".18em",
                    fontSize: ".9rem"
                  }}
                >
                  Name
                </div>

                <div className="rounded-xl bg-white border border-[#d4d4d4] px-5 py-4 text-xl shadow-sm">
                  {submittedTeam.name}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(groups).map((groupNum) => (
                  <div
                    key={groupNum}
                    className="rounded-xl bg-white border border-[#d4d4d4] px-5 py-4 shadow-sm"
                  >
                    <div
                      className="uppercase text-[#24342c] mb-1"
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontWeight: 700,
                        letterSpacing: ".16em",
                        fontSize: ".8rem"
                      }}
                    >
                      Group {groupNum}
                    </div>

                    <div
                      className="text-[#222]"
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: "1.2rem"
                      }}
                    >
                      {submittedTeam[`group${groupNum}`]}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="text-center mt-8 text-[#666]"
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: "1rem"
                }}
              >
                Screenshot this page if you want a personal copy of your picks.
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}

export default function App() {
  const isConfirmationPage = window.location.pathname === "/confirmation";

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const scriptURL = "https://script.google.com/macros/s/AKfycbwC5FqXpq2c9y7uwXl_rrUTA47yPZTKXXQzWahKtf7VyM0QRG8rQ5XrX3W6NnwZF9vQ_w/exec";

    try {
      setSubmitting(true);

      await fetch(scriptURL, {
        method: "POST",
        body: JSON.stringify(formData)
      });

      sessionStorage.setItem("pgaSubmittedTeam", JSON.stringify(formData));
      window.location.href = "/confirmation";
    } catch (err) {
      console.error(err);
      alert("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isConfirmationPage) {
    return <ConfirmationPage />;
  }

  return (
    <PageShell>
      <div
        className="
          max-w-5xl
          mx-auto
          mt-10
          rounded-[28px]
          overflow-hidden
          shadow-[0_20px_70px_rgba(0,0,0,.35)]
          border
          border-white/20
        "
      >
        <div
          className="px-8 md:px-12 py-8 text-white"
          style={{
            background:
              "linear-gradient(135deg,#0c281c 0%, #03251c 50%, #0b4b32 100%)"
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div
              className="text-[#d2aa53]"
              style={{
                fontSize: "2.2rem"
              }}
            >
              🏆
            </div>

            <div
              className="
                uppercase
                tracking-[.12em]
              "
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: "2rem",
                fontWeight: 700
              }}
            >
              How To Play
            </div>
          </div>

          <div
            className="
              space-y-3
              text-white/95
            "
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 300,
              fontSize: "1.25rem",
              letterSpacing: ".01em"
            }}
          >
            <div>• 2 teams per household.</div>
            <div>• Take one player from each group.</div>
            <div>• Your top 10 scores will be your total score.</div>
            <div>• If your player withdraws during his round, he will not be replaced.</div>
          </div>
        </div>

        <div className="bg-[#f6f6f4] px-8 md:px-12 py-10">
          <form onSubmit={handleSubmit}>
            <div className="mb-10">
              <label
                className="
                  block
                  mb-4
                  uppercase
                  text-[#24342c]
                "
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  letterSpacing: ".18em",
                  fontSize: ".9rem"
                }}
              >
                Your Name
              </label>

              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="
                  w-full
                  rounded-xl
                  border
                  border-[#d4d4d4]
                  bg-white
                  px-5
                  py-4
                  text-lg
                  shadow-sm
                  outline-none
                  transition
                  focus:border-[#0c5c38]
                  focus:ring-4
                  focus:ring-green-200
                "
              />
            </div>

            <div className="flex items-center gap-5 mb-10">
              <div className="h-[2px] flex-1 bg-[#b28a44]" />

              <div
                className="
                  uppercase
                  text-[#22342d]
                  whitespace-nowrap
                "
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  letterSpacing: ".16em",
                  fontSize: "1rem"
                }}
              >
                Select One Player From Each Group
              </div>

              <div className="h-[2px] flex-1 bg-[#b28a44]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-7">
              {Object.entries(groups).map(([groupNum, players]) => (
                <div key={groupNum}>
                  <label
                    className="
                      block
                      mb-3
                      uppercase
                      text-[#24342c]
                    "
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontWeight: 700,
                      letterSpacing: ".16em",
                      fontSize: ".8rem"
                    }}
                  >
                    Group {groupNum}
                  </label>

                  <select
                    required
                    name={`group${groupNum}`}
                    value={formData[`group${groupNum}`] || ""}
                    onChange={handleChange}
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[#d6d6d6]
                      bg-white
                      px-4
                      py-4
                      text-[#444]
                      shadow-sm
                      outline-none
                      transition
                      focus:border-[#0c5c38]
                      focus:ring-4
                      focus:ring-green-200
                    "
                  >
                    <option value="">
                      Select a player
                    </option>

                    {players.map((player) => (
                      <option
                        key={player}
                        value={player}
                      >
                        {player}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="text-center mt-14">
              <button
                type="submit"
                disabled={submitting}
                className="
                  relative
                  overflow-hidden
                  px-14
                  py-5
                  rounded-xl
                  text-white
                  uppercase
                  transition
                  hover:scale-[1.015]
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  shadow-[0_10px_35px_rgba(0,0,0,.28)]
                "
                style={{
                  background:
                    "linear-gradient(135deg,#07261a 0%, #0d5938 100%)",
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  fontSize: "1.3rem"
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">
                    ⛳
                  </span>

                  <span>
                    {submitting ? "Submitting..." : "Submit My Team"}
                  </span>
                </div>
              </button>
            </div>

            <div
              className="
                text-center
                mt-6
                text-[#666]
              "
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: ".9rem"
              }}
            >
              Your picks will be saved securely.
            </div>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
