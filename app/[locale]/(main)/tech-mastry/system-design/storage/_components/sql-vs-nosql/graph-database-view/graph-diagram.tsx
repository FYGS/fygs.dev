export function GraphDiagram() {
  return (
    <div className="w-1/3 h-full flex flex-col">
      <div className="text-sm font-medium mb-2 text-center">
        Visualisation du Graphe
      </div>
      <div className="flex-1 border rounded-md p-2 overflow-auto bg-slate-900">
        <div className="h-full w-full relative">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 300 300"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Person Nodes */}
            <g>
              {/* Person 1 */}
              <circle
                cx="75"
                cy="75"
                r="25"
                fill="#e0e7ff"
                stroke="#6366f1"
                strokeWidth="2"
              />
              <text
                x="75"
                y="75"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
              >
                John
              </text>
              <text
                x="75"
                y="90"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
              >
                Person
              </text>

              {/* Person 2 */}
              <circle
                cx="200"
                cy="75"
                r="25"
                fill="#e0e7ff"
                stroke="#6366f1"
                strokeWidth="2"
              />
              <text
                x="200"
                y="75"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
              >
                Alice
              </text>
              <text
                x="200"
                y="90"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
              >
                Person
              </text>

              {/* Person 3 */}
              <circle
                cx="250"
                cy="175"
                r="25"
                fill="#e0e7ff"
                stroke="#6366f1"
                strokeWidth="2"
              />
              <text
                x="250"
                y="175"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
              >
                Bob
              </text>
              <text
                x="250"
                y="190"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
              >
                Person
              </text>
            </g>

            {/* Company Nodes */}
            <g>
              {/* Company 1 */}
              <rect
                x="50"
                y="200"
                width="50"
                height="50"
                rx="5"
                fill="#cffafe"
                stroke="#06b6d4"
                strokeWidth="2"
              />
              <text
                x="75"
                y="220"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
              >
                Acme Inc
              </text>
              <text
                x="75"
                y="235"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
              >
                Company
              </text>

              {/* Company 2 */}
              <rect
                x="150"
                y="200"
                width="50"
                height="50"
                rx="5"
                fill="#cffafe"
                stroke="#06b6d4"
                strokeWidth="2"
              />
              <text
                x="175"
                y="220"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
              >
                TechCorp
              </text>
              <text
                x="175"
                y="235"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
              >
                Company
              </text>
            </g>

            {/* Relationships */}
            <g>
              {/* WORKS_AT relationships */}
              <path
                d="M 75,100 L 75,200"
                stroke="#06b6d4"
                strokeWidth="2"
                fill="none"
              />
              <polygon
                points="75,190 70,180 80,180"
                fill="#06b6d4"
              />
              <text
                x="50"
                y="150"
                textAnchor="middle"
                fontSize="8"
                fill="#0891b2"
              >
                WORKS_AT
              </text>

              <path
                d="M 190,95 L 90,200"
                stroke="#06b6d4"
                strokeWidth="2"
                fill="none"
              />
              <polygon
                points="95,190 85,185 95,180"
                fill="#06b6d4"
              />
              <text
                x="130"
                y="150"
                textAnchor="middle"
                fontSize="8"
                fill="#0891b2"
              >
                WORKS_AT
              </text>

              <path
                d="M 240,195 L 200,210"
                stroke="#06b6d4"
                strokeWidth="2"
                fill="none"
              />
              <polygon
                points="205,205 195,210 200,200"
                fill="#06b6d4"
              />
              <text
                x="225"
                y="190"
                textAnchor="middle"
                fontSize="8"
                fill="#0891b2"
              >
                WORKS_AT
              </text>

              {/* KNOWS relationships */}
              <path
                d="M 100,75 L 175,75"
                stroke="#6366f1"
                strokeWidth="2"
                fill="none"
              />
              <polygon
                points="165,70 175,75 165,80"
                fill="#6366f1"
              />
              <text
                x="137"
                y="65"
                textAnchor="middle"
                fontSize="8"
                fill="#4f46e5"
              >
                KNOWS
              </text>

              <path
                d="M 220,95 L 240,150"
                stroke="#6366f1"
                strokeWidth="2"
                fill="none"
              />
              <polygon
                points="235,140 240,150 225,145"
                fill="#6366f1"
              />
              <text
                x="240"
                y="120"
                textAnchor="middle"
                fontSize="8"
                fill="#4f46e5"
              >
                KNOWS
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
