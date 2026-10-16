export function ConnectionLines() {
  return (
    <>
      {/* Connection lines */}
      {/* User to API Gateway */}
      <path
        d="M 80,250 L 150,250"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeDasharray="5,5"
      />

      {/* API Gateway to Services */}
      <path
        d="M 250,250 L 340,100"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
      <path
        d="M 250,250 L 340,175"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
      <path
        d="M 250,250 L 340,250"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
      <path
        d="M 250,250 L 340,325"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
      <path
        d="M 250,250 L 340,400"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />

      {/* Services to Database */}
      <path
        d="M 460,100 L 550,250"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
      <path
        d="M 460,175 L 550,250"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
      <path
        d="M 460,250 L 550,250"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
      <path
        d="M 460,325 L 550,250"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
      <path
        d="M 460,400 L 550,250"
        stroke="#94a3b8"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
    </>
  );
}
