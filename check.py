import os

label_dirs = [
    r"C:\Users\p14pr\Desktop\helmet\Dataset\train\labels",
    r"C:\Users\p14pr\Desktop\helmet\Dataset\valid\labels",
    r"C:\Users\p14pr\Desktop\helmet\Dataset\test\labels"
]

classes = set()

for d in label_dirs:
    for file in os.listdir(d):
        if not file.endswith(".txt"):
            continue
        with open(os.path.join(d, file)) as f:
            for line in f:
                if line.strip():
                    classes.add(int(line.split()[0]))

print("Classes found in dataset:", classes)
